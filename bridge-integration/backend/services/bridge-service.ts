/**
 * Bridge API Service Layer
 * Handles Bridge API integration logic
 */
import { BridgeSDK, createBridgeClient } from '../../sdk/typescript/src/bridge-sdk';
import { Pool } from 'pg';
import type { Customer, Wallet, Transfer, Card } from '../../sdk/typescript/src/types';

export class BridgeService {
  private bridgeClient: BridgeSDK;
  private db: Pool;

  constructor(apiKey: string, environment: 'sandbox' | 'production', dbPool: Pool) {
    this.bridgeClient = createBridgeClient(apiKey, environment);
    this.db = dbPool;
  }

  // Customer Management
  async createCustomer(
    userId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<Customer> {
    // Create customer in Bridge
    const customer = await this.bridgeClient.createCustomer(email, firstName, lastName);

    // Store in database
    await this.db.query(
      `INSERT INTO bridge_customers (user_id, bridge_customer_id, email, kyc_status)
       VALUES ($1, $2, $3, $4)`,
      [userId, customer.id, email, customer.kyc_status]
    );

    return customer;
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return await this.bridgeClient.getCustomer(customerId);
  }

  async startKYCProcess(customerId: string): Promise<any> {
    const result = await this.bridgeClient.startKYC(customerId);

    // Update KYC status in database
    await this.db.query(
      `UPDATE bridge_customers 
       SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE bridge_customer_id = $2`,
      ['pending', customerId]
    );

    return result;
  }

  async updateKYCStatus(customerId: string, status: string, kycData?: any): Promise<void> {
    await this.db.query(
      `UPDATE bridge_customers 
       SET kyc_status = $1, kyc_data = $2, updated_at = CURRENT_TIMESTAMP
       WHERE bridge_customer_id = $3`,
      [status, JSON.stringify(kycData || {}), customerId]
    );
  }

  // Wallet Management
  async createWallet(
    customerId: string,
    currency: string,
    walletType: 'crypto' | 'liquidity' = 'crypto'
  ): Promise<Wallet> {
    // Create wallet in Bridge
    const wallet = await this.bridgeClient.createWallet(customerId, currency, walletType);

    // Get customer's internal ID
    const customerResult = await this.db.query(
      'SELECT id FROM bridge_customers WHERE bridge_customer_id = $1',
      [customerId]
    );

    if (customerResult.rows.length > 0) {
      // Store in database
      await this.db.query(
        `INSERT INTO crypto_wallets (customer_id, bridge_wallet_id, wallet_type, currency, address, balance)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customerResult.rows[0].id, wallet.id, walletType, currency, wallet.address, wallet.balance]
      );
    }

    return wallet;
  }

  async getWallet(walletId: string): Promise<Wallet> {
    return await this.bridgeClient.getWallet(walletId);
  }

  async listWallets(customerId: string): Promise<Wallet[]> {
    return await this.bridgeClient.listWallets(customerId);
  }

  async syncWalletBalance(walletId: string): Promise<number> {
    const wallet = await this.bridgeClient.getWallet(walletId);
    
    // Update balance in database
    await this.db.query(
      `UPDATE crypto_wallets 
       SET balance = $1, updated_at = CURRENT_TIMESTAMP
       WHERE bridge_wallet_id = $2`,
      [wallet.balance, walletId]
    );

    return wallet.balance;
  }

  // Transfer Management
  async createTransfer(
    customerId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    currency: string
  ): Promise<Transfer> {
    // Create transfer in Bridge
    const transfer = await this.bridgeClient.createTransfer(
      fromWalletId,
      toWalletId,
      amount,
      currency
    );

    // Get customer's internal ID
    const customerResult = await this.db.query(
      'SELECT id FROM bridge_customers WHERE bridge_customer_id = $1',
      [customerId]
    );

    if (customerResult.rows.length > 0) {
      // Store transaction in database
      await this.db.query(
        `INSERT INTO bridge_transactions 
         (customer_id, bridge_transaction_id, transaction_type, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customerResult.rows[0].id, transfer.id, 'transfer', amount, currency, transfer.status]
      );
    }

    return transfer;
  }

  async getTransfer(transferId: string): Promise<Transfer> {
    return await this.bridgeClient.getTransfer(transferId);
  }

  // On/Off Ramp Operations
  async onRamp(
    customerId: string,
    walletId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<any> {
    const result = await this.bridgeClient.onRamp(
      customerId,
      walletId,
      amount,
      currency,
      paymentMethod
    );

    // Log transaction
    const customerResult = await this.db.query(
      'SELECT id FROM bridge_customers WHERE bridge_customer_id = $1',
      [customerId]
    );

    if (customerResult.rows.length > 0) {
      await this.db.query(
        `INSERT INTO bridge_transactions 
         (customer_id, transaction_type, amount, currency, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customerResult.rows[0].id, 'on_ramp', amount, currency, 'pending', JSON.stringify(result)]
      );
    }

    return result;
  }

  async offRamp(
    customerId: string,
    walletId: string,
    amount: number,
    currency: string,
    destinationAccount: string
  ): Promise<any> {
    const result = await this.bridgeClient.offRamp(
      customerId,
      walletId,
      amount,
      currency,
      destinationAccount
    );

    // Log transaction
    const customerResult = await this.db.query(
      'SELECT id FROM bridge_customers WHERE bridge_customer_id = $1',
      [customerId]
    );

    if (customerResult.rows.length > 0) {
      await this.db.query(
        `INSERT INTO bridge_transactions 
         (customer_id, transaction_type, amount, currency, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customerResult.rows[0].id, 'off_ramp', amount, currency, 'pending', JSON.stringify(result)]
      );
    }

    return result;
  }

  // Card Management
  async issueCard(
    customerId: string,
    cardType: string = 'virtual',
    spendingLimit?: number
  ): Promise<Card> {
    const card = await this.bridgeClient.issueCard(customerId, cardType, spendingLimit);

    // Store in database
    const customerResult = await this.db.query(
      'SELECT id FROM bridge_customers WHERE bridge_customer_id = $1',
      [customerId]
    );

    if (customerResult.rows.length > 0) {
      await this.db.query(
        `INSERT INTO cards 
         (customer_id, bridge_card_id, card_type, last_four, brand, status, spending_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [customerResult.rows[0].id, card.id, cardType, card.last_four, card.brand, card.status, spendingLimit]
      );
    }

    return card;
  }

  async freezeCard(cardId: string): Promise<boolean> {
    const result = await this.bridgeClient.freezeCard(cardId);

    // Update status in database
    await this.db.query(
      `UPDATE cards 
       SET status = 'frozen', updated_at = CURRENT_TIMESTAMP
       WHERE bridge_card_id = $1`,
      [cardId]
    );

    return result;
  }

  async cancelCard(cardId: string): Promise<boolean> {
    const result = await this.bridgeClient.cancelCard(cardId);

    // Update status in database
    await this.db.query(
      `UPDATE cards 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE bridge_card_id = $1`,
      [cardId]
    );

    return result;
  }

  // External Accounts
  async addExternalAccount(
    customerId: string,
    accountNumber: string,
    routingNumber: string,
    accountType: string = 'checking'
  ): Promise<any> {
    const account = await this.bridgeClient.addExternalAccount(
      customerId,
      accountNumber,
      routingNumber,
      accountType
    );

    // Store in database
    const customerResult = await this.db.query(
      'SELECT id FROM bridge_customers WHERE bridge_customer_id = $1',
      [customerId]
    );

    if (customerResult.rows.length > 0) {
      await this.db.query(
        `INSERT INTO external_accounts 
         (customer_id, bridge_account_id, account_number_last_four, routing_number, account_type, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          customerResult.rows[0].id,
          account.id,
          accountNumber.slice(-4),
          routingNumber,
          accountType,
          'pending'
        ]
      );
    }

    return account;
  }

  // Transaction History
  async getTransactionHistory(
    customerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM bridge_transactions 
       WHERE customer_id = (SELECT id FROM bridge_customers WHERE bridge_customer_id = $1)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [customerId, limit, offset]
    );

    return result.rows;
  }

  // Webhook Processing
  async processWebhook(eventType: string, eventData: any): Promise<void> {
    // Store webhook event
    await this.db.query(
      `INSERT INTO webhook_events (event_type, event_data, status)
       VALUES ($1, $2, $3)`,
      [eventType, JSON.stringify(eventData), 'pending']
    );

    // Process based on event type
    switch (eventType) {
      case 'customer.kyc.completed':
        await this.updateKYCStatus(eventData.customer_id, 'approved', eventData);
        break;
      case 'transfer.completed':
        await this.updateTransactionStatus(eventData.transfer_id, 'completed');
        break;
      case 'transfer.failed':
        await this.updateTransactionStatus(eventData.transfer_id, 'failed', eventData.error);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
  }

  private async updateTransactionStatus(
    transactionId: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    await this.db.query(
      `UPDATE bridge_transactions 
       SET status = $1, error_message = $2, completed_at = CURRENT_TIMESTAMP
       WHERE bridge_transaction_id = $3`,
      [status, errorMessage || null, transactionId]
    );
  }
}
