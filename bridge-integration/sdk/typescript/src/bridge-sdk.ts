/**
 * Bridge API SDK for TypeScript
 * Complete integration with Bridge payment platform
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  BridgeConfig,
  BridgeEnvironment,
  Customer,
  Wallet,
  Transfer,
  Card,
  ExternalAccount,
  WalletType,
  APIResponse
} from './types';

export class BridgeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'BridgeAPIError';
  }
}

export class BridgeSDK {
  private client: AxiosInstance;
  private apiKey: string;
  private environment: BridgeEnvironment;

  constructor(config: BridgeConfig) {
    this.apiKey = config.apiKey;
    this.environment = config.environment || 'sandbox';
    
    const baseURL = this.getBaseURL();
    
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BridgeSDK-TypeScript/1.0'
      }
    });

    this.setupInterceptors();
  }

  private getBaseURL(): string {
    return this.environment === 'sandbox'
      ? 'https://api.sandbox.bridge.xyz/v1'
      : 'https://api.bridge.xyz/v1';
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response) {
          const errorData = error.response.data as any;
          throw new BridgeAPIError(
            errorData?.message || 'Bridge API error',
            error.response.status,
            errorData?.code
          );
        }
        throw error;
      }
    );
  }

  // Customer Management
  async createCustomer(
    email: string,
    firstName?: string,
    lastName?: string,
    metadata?: Record<string, any>
  ): Promise<Customer> {
    const response = await this.client.post<Customer>('/customers', {
      email,
      first_name: firstName,
      last_name: lastName,
      metadata: metadata || {}
    });
    return response.data;
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${customerId}`);
    return response.data;
  }

  async listCustomers(limit: number = 100, offset: number = 0): Promise<Customer[]> {
    const response = await this.client.get<{ customers: Customer[] }>('/customers', {
      params: { limit, offset }
    });
    return response.data.customers;
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    await this.client.delete(`/customers/${customerId}`);
    return true;
  }

  async startKYC(customerId: string): Promise<any> {
    const response = await this.client.post(`/customers/${customerId}/kyc`);
    return response.data;
  }

  // Wallet Management
  async createWallet(
    customerId: string,
    currency: string,
    walletType: WalletType = 'crypto'
  ): Promise<Wallet> {
    const response = await this.client.post<Wallet>('/wallets', {
      customer_id: customerId,
      currency,
      wallet_type: walletType
    });
    return response.data;
  }

  async getWallet(walletId: string): Promise<Wallet> {
    const response = await this.client.get<Wallet>(`/wallets/${walletId}`);
    return response.data;
  }

  async listWallets(customerId: string): Promise<Wallet[]> {
    const response = await this.client.get<{ wallets: Wallet[] }>('/wallets', {
      params: { customer_id: customerId }
    });
    return response.data.wallets;
  }

  async getWalletBalance(walletId: string): Promise<number> {
    const wallet = await this.getWallet(walletId);
    return wallet.balance;
  }

  // Payment Processing
  async createTransfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    currency: string
  ): Promise<Transfer> {
    const response = await this.client.post<Transfer>('/transfers', {
      from_wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      amount,
      currency
    });
    return response.data;
  }

  async getTransfer(transferId: string): Promise<Transfer> {
    const response = await this.client.get<Transfer>(`/transfers/${transferId}`);
    return response.data;
  }

  async onRamp(
    customerId: string,
    walletId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<any> {
    const response = await this.client.post('/on-ramp', {
      customer_id: customerId,
      wallet_id: walletId,
      amount,
      currency,
      payment_method: paymentMethod
    });
    return response.data;
  }

  async offRamp(
    customerId: string,
    walletId: string,
    amount: number,
    currency: string,
    destinationAccount: string
  ): Promise<any> {
    const response = await this.client.post('/off-ramp', {
      customer_id: customerId,
      wallet_id: walletId,
      amount,
      currency,
      destination_account: destinationAccount
    });
    return response.data;
  }

  // Card Management
  async issueCard(
    customerId: string,
    cardType: string = 'virtual',
    spendingLimit?: number
  ): Promise<Card> {
    const response = await this.client.post<Card>('/cards', {
      customer_id: customerId,
      card_type: cardType,
      spending_limit: spendingLimit
    });
    return response.data;
  }

  async getCard(cardId: string): Promise<Card> {
    const response = await this.client.get<Card>(`/cards/${cardId}`);
    return response.data;
  }

  async freezeCard(cardId: string): Promise<boolean> {
    await this.client.post(`/cards/${cardId}/freeze`);
    return true;
  }

  async cancelCard(cardId: string): Promise<boolean> {
    await this.client.delete(`/cards/${cardId}`);
    return true;
  }

  // External Accounts
  async addExternalAccount(
    customerId: string,
    accountNumber: string,
    routingNumber: string,
    accountType: string = 'checking'
  ): Promise<ExternalAccount> {
    const response = await this.client.post<ExternalAccount>('/external-accounts', {
      customer_id: customerId,
      account_number: accountNumber,
      routing_number: routingNumber,
      account_type: accountType
    });
    return response.data;
  }

  async listExternalAccounts(customerId: string): Promise<ExternalAccount[]> {
    const response = await this.client.get<{ accounts: ExternalAccount[] }>(
      '/external-accounts',
      { params: { customer_id: customerId } }
    );
    return response.data.accounts;
  }

  // Webhook Management
  async registerWebhook(url: string, events: string[]): Promise<any> {
    const response = await this.client.post('/webhooks', { url, events });
    return response.data;
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const crypto = await import('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }
}

// Convenience factory function
export function createBridgeClient(
  apiKey?: string,
  environment: BridgeEnvironment = 'sandbox'
): BridgeSDK {
  const key = apiKey || process.env.BRIDGE_API_KEY;
  if (!key) {
    throw new Error('Bridge API key is required');
  }
  return new BridgeSDK({ apiKey: key, environment });
}
