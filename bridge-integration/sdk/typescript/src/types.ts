/**
 * TypeScript type definitions for Bridge API and AP2 protocol
 */

export enum BridgeEnvironment {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production'
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum WalletType {
  CRYPTO = 'crypto',
  LIQUIDITY = 'liquidity'
}

export enum TransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum MandateType {
  INTENT = 'intent',
  CART = 'cart'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum AgentRole {
  INITIATOR = 'initiator',
  VALIDATOR = 'validator',
  EXECUTOR = 'executor'
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  kyc_status: KYCStatus;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Wallet {
  id: string;
  customer_id: string;
  wallet_type: WalletType;
  currency: string;
  address: string;
  balance: number;
  created_at: string;
}

export interface Transfer {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  created_at: string;
  completed_at?: string;
}

export interface Card {
  id: string;
  customer_id: string;
  last_four: string;
  brand: string;
  status: string;
  created_at: string;
}

export interface ExternalAccount {
  id: string;
  customer_id: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  status: string;
}

export interface Mandate {
  id: string;
  mandate_type: MandateType;
  agent_id: string;
  amount: number;
  currency: string;
  description: string;
  expiry: string;
  signature: string;
  metadata?: Record<string, any>;
}

export interface X402PaymentRequest {
  request_id: string;
  amount: number;
  currency: string;
  recipient_agent: string;
  payment_method: string;
  mandate_id?: string;
  metadata?: Record<string, any>;
}

export interface AgentConsensus {
  agent_id: string;
  vote: boolean;
  signature: string;
  timestamp: string;
}

export interface MultiAgentTransaction {
  transaction_id: string;
  initiator_agent: string;
  validator_agents: string[];
  required_votes: number;
  consensus_votes: AgentConsensus[];
  status: PaymentStatus;
  amount: number;
  currency: string;
}

export interface BridgeConfig {
  apiKey: string;
  environment?: BridgeEnvironment;
  timeout?: number;
}

export interface AP2Config {
  agentId: string;
  agentKey: string;
  byzantineThreshold?: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  created_at: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
