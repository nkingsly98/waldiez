/**
 * AP2/X402 Protocol Integration for TypeScript
 * Agent Payment Protocol for autonomous AI agent payments
 */
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { BridgeSDK } from './bridge-sdk';
import type {
  AP2Config,
  Mandate,
  MandateType,
  X402PaymentRequest,
  MultiAgentTransaction,
  AgentConsensus,
  PaymentStatus,
  AgentRole
} from './types';

export class AP2Protocol {
  private bridgeSDK: BridgeSDK;
  private agentId: string;
  private agentKey: string;
  private byzantineThreshold: number;

  constructor(bridgeSDK: BridgeSDK, config: AP2Config) {
    this.bridgeSDK = bridgeSDK;
    this.agentId = config.agentId;
    this.agentKey = config.agentKey;
    this.byzantineThreshold = config.byzantineThreshold || 0.67;
  }

  /**
   * Create a payment mandate for agent authorization
   */
  createMandate(
    mandateType: MandateType,
    amount: number,
    currency: string,
    description: string,
    expiry: Date,
    metadata?: Record<string, any>
  ): Mandate {
    const mandateId = uuidv4();
    const mandateData = {
      id: mandateId,
      mandate_type: mandateType,
      agent_id: this.agentId,
      amount,
      currency,
      description,
      expiry: expiry.toISOString(),
      metadata: metadata || {}
    };

    // Create signature
    const dataStr = JSON.stringify(mandateData, Object.keys(mandateData).sort());
    const signature = crypto
      .createHash('sha256')
      .update(dataStr + this.agentKey)
      .digest('hex');

    return {
      ...mandateData,
      signature
    };
  }

  /**
   * Verify mandate signature and validity
   */
  verifyMandate(mandate: Mandate): boolean {
    // Check expiry
    if (new Date(mandate.expiry) < new Date()) {
      return false;
    }

    // Verify signature
    const { signature, ...mandateData } = mandate;
    const dataStr = JSON.stringify(mandateData, Object.keys(mandateData).sort());
    const expectedSignature = crypto
      .createHash('sha256')
      .update(dataStr + this.agentKey)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Create X402 payment request
   */
  createX402PaymentRequest(
    amount: number,
    currency: string,
    recipientAgent: string,
    paymentMethod: string,
    mandateId?: string,
    metadata?: Record<string, any>
  ): X402PaymentRequest {
    return {
      request_id: uuidv4(),
      amount,
      currency,
      recipient_agent: recipientAgent,
      payment_method: paymentMethod,
      mandate_id: mandateId,
      metadata: metadata || {}
    };
  }

  /**
   * Process agent-to-agent payment
   */
  async processAgentPayment(
    paymentRequest: X402PaymentRequest,
    fromWalletId: string,
    toWalletId: string
  ): Promise<any> {
    // Create transfer using Bridge SDK
    const transfer = await this.bridgeSDK.createTransfer(
      fromWalletId,
      toWalletId,
      paymentRequest.amount,
      paymentRequest.currency
    );

    return {
      payment_request_id: paymentRequest.request_id,
      transfer_id: transfer.id,
      status: transfer.status,
      agent_id: this.agentId
    };
  }

  /**
   * Initiate a multi-agent consensus transaction
   */
  initiateMultiAgentTransaction(
    validatorAgents: string[],
    amount: number,
    currency: string,
    requiredVotes?: number
  ): MultiAgentTransaction {
    const votes = requiredVotes || Math.floor(validatorAgents.length * this.byzantineThreshold);

    return {
      transaction_id: uuidv4(),
      initiator_agent: this.agentId,
      validator_agents: validatorAgents,
      required_votes: votes,
      consensus_votes: [],
      status: 'pending',
      amount,
      currency
    };
  }

  /**
   * Add a consensus vote from a validator agent
   */
  addConsensusVote(
    transaction: MultiAgentTransaction,
    agentId: string,
    vote: boolean,
    agentSignature: string
  ): MultiAgentTransaction {
    if (!transaction.validator_agents.includes(agentId)) {
      throw new Error(`Agent ${agentId} is not a validator for this transaction`);
    }

    // Check if agent already voted
    const existingVote = transaction.consensus_votes.find(v => v.agent_id === agentId);
    if (existingVote) {
      throw new Error(`Agent ${agentId} has already voted`);
    }

    const consensus: AgentConsensus = {
      agent_id: agentId,
      vote,
      signature: agentSignature,
      timestamp: new Date().toISOString()
    };

    transaction.consensus_votes.push(consensus);

    // Check if consensus is reached
    const positiveVotes = transaction.consensus_votes.filter(v => v.vote).length;
    if (positiveVotes >= transaction.required_votes) {
      transaction.status = 'authorized';
    } else if (transaction.consensus_votes.length === transaction.validator_agents.length) {
      // All agents voted but consensus not reached
      transaction.status = 'failed';
    }

    return transaction;
  }

  /**
   * Execute a multi-agent transaction after consensus
   */
  async executeMultiAgentTransaction(
    transaction: MultiAgentTransaction,
    fromWalletId: string,
    toWalletId: string
  ): Promise<any> {
    if (transaction.status !== 'authorized') {
      throw new Error('Transaction not authorized for execution');
    }

    // Execute the transfer
    const transfer = await this.bridgeSDK.createTransfer(
      fromWalletId,
      toWalletId,
      transaction.amount,
      transaction.currency
    );

    transaction.status = 'completed';

    return {
      transaction_id: transaction.transaction_id,
      transfer_id: transfer.id,
      status: transfer.status,
      consensus_votes: transaction.consensus_votes.length,
      required_votes: transaction.required_votes
    };
  }

  /**
   * Validate Byzantine fault tolerance threshold
   */
  validateByzantineTolerance(totalAgents: number, faultyAgents: number): boolean {
    const maxFaulty = Math.floor((totalAgents - 1) / 3);
    return faultyAgents <= maxFaulty;
  }

  /**
   * Create digital signature for agent actions
   */
  createAgentSignature(data: Record<string, any>): string {
    const dataStr = JSON.stringify(data, Object.keys(data).sort());
    return crypto
      .createHash('sha256')
      .update(dataStr + this.agentKey)
      .digest('hex');
  }

  /**
   * Verify agent signature
   */
  verifyAgentSignature(
    data: Record<string, any>,
    signature: string,
    agentKey: string
  ): boolean {
    const dataStr = JSON.stringify(data, Object.keys(data).sort());
    const expected = crypto
      .createHash('sha256')
      .update(dataStr + agentKey)
      .digest('hex');
    return expected === signature;
  }
}

export class AP2SecurityManager {
  private requiredAgents: number;
  private agentRegistry: Map<string, any>;

  constructor(requiredAgents: number = 3) {
    this.requiredAgents = requiredAgents;
    this.agentRegistry = new Map();
  }

  /**
   * Register an agent in the security framework
   */
  registerAgent(
    agentId: string,
    publicKey: string,
    role: AgentRole,
    metadata?: Record<string, any>
  ): void {
    this.agentRegistry.set(agentId, {
      public_key: publicKey,
      role,
      registered_at: new Date().toISOString(),
      metadata: metadata || {}
    });
  }

  /**
   * Get agent information
   */
  getAgent(agentId: string): any | undefined {
    return this.agentRegistry.get(agentId);
  }

  /**
   * Validate transaction meets security requirements
   */
  validateTransactionSecurity(transaction: MultiAgentTransaction): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const validation = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Check minimum number of validators
    if (transaction.validator_agents.length < this.requiredAgents) {
      validation.valid = false;
      validation.errors.push(
        `Minimum ${this.requiredAgents} validators required`
      );
    }

    // Check Byzantine tolerance
    const totalAgents = transaction.validator_agents.length + 1; // +1 for initiator
    const maxFaulty = Math.floor((totalAgents - 1) / 3);
    if (transaction.required_votes < (totalAgents - maxFaulty)) {
      validation.warnings.push('Byzantine tolerance may not be sufficient');
    }

    return validation;
  }
}
