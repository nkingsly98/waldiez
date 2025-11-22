/**
 * Payment Service
 * Handles payment processing and conversions
 */
import { Pool } from 'pg';
import { BridgeService } from './bridge-service';

export class PaymentService {
  private db: Pool;
  private bridgeService: BridgeService;

  constructor(dbPool: Pool, bridgeService: BridgeService) {
    this.db = dbPool;
    this.bridgeService = bridgeService;
  }

  async processPayment(
    customerId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    currency: string,
    metadata?: any
  ): Promise<any> {
    // Check sufficient balance
    const wallet = await this.bridgeService.getWallet(fromWalletId);
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create transfer
    const transfer = await this.bridgeService.createTransfer(
      customerId,
      fromWalletId,
      toWalletId,
      amount,
      currency
    );

    // Update wallet balances
    await this.bridgeService.syncWalletBalance(fromWalletId);
    await this.bridgeService.syncWalletBalance(toWalletId);

    return transfer;
  }

  async getPaymentStatus(transferId: string): Promise<any> {
    return await this.bridgeService.getTransfer(transferId);
  }

  async listPayments(customerId: string, limit: number = 50): Promise<any[]> {
    return await this.bridgeService.getTransactionHistory(customerId, limit);
  }

  async estimateFees(amount: number, currency: string, type: 'on_ramp' | 'off_ramp' | 'transfer'): Promise<any> {
    // Fee calculation logic (placeholder)
    const feePercentage = type === 'transfer' ? 0.001 : 0.01; // 0.1% for transfers, 1% for on/off-ramp
    const fee = amount * feePercentage;

    return {
      amount,
      currency,
      type,
      fee,
      total: amount + fee
    };
  }
}
