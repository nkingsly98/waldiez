/**
 * AP2 Protocol Service
 * Handles AP2/X402 protocol operations for agent payments
 */
import { Pool } from 'pg';
import { AP2Protocol, AP2SecurityManager } from '../../sdk/typescript/src/ap2-integration';
import { BridgeService } from './bridge-service';
import type {
  Mandate,
  MandateType,
  X402PaymentRequest,
  MultiAgentTransaction,
  AgentRole
} from '../../sdk/typescript/src/types';

export class AP2Service {
  private db: Pool;
  private bridgeService: BridgeService;
  private securityManager: AP2SecurityManager;

  constructor(dbPool: Pool, bridgeService: BridgeService) {
    this.db = dbPool;
    this.bridgeService = bridgeService;
    this.securityManager = new AP2SecurityManager(3); // Require minimum 3 agents
  }

  // Agent Management
  async registerAgent(
    userId: string,
    agentName: string,
    agentType: string,
    publicKey: string,
    role: AgentRole,
    walletId?: string,
    spendingLimit?: number,
    config?: any
  ): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO ai_agents 
       (user_id, agent_name, agent_type, public_key, role, wallet_id, spending_limit, config)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, agentName, agentType, publicKey, role, walletId, spendingLimit, JSON.stringify(config || {})]
    );

    const agent = result.rows[0];

    // Register with security manager
    this.securityManager.registerAgent(agent.id, publicKey, role);

    return agent;
  }

  async getAgent(agentId: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM ai_agents WHERE id = $1',
      [agentId]
    );
    return result.rows[0];
  }

  async listUserAgents(userId: string): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM ai_agents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async updateAgentStatus(agentId: string, isActive: boolean): Promise<void> {
    await this.db.query(
      'UPDATE ai_agents SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isActive, agentId]
    );
  }

  // Mandate Management
  async createMandate(
    agentId: string,
    agentKey: string,
    mandateType: MandateType,
    amount: number,
    currency: string,
    description: string,
    expiryHours: number = 24,
    metadata?: any
  ): Promise<Mandate> {
    // Get agent details
    const agent = await this.getAgent(agentId);
    if (!agent || !agent.is_active) {
      throw new Error('Agent not found or inactive');
    }

    // Create mandate using AP2 protocol
    const ap2 = new AP2Protocol(
      this.bridgeService['bridgeClient'], // Access bridge client
      { agentId, agentKey }
    );

    const expiryDate = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    const mandate = ap2.createMandate(
      mandateType,
      amount,
      currency,
      description,
      expiryDate,
      metadata
    );

    // Store in database
    await this.db.query(
      `INSERT INTO payment_mandates 
       (mandate_id, agent_id, mandate_type, amount, currency, description, signature, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        mandate.id,
        agentId,
        mandateType,
        amount,
        currency,
        description,
        mandate.signature,
        expiryDate,
        JSON.stringify(metadata || {})
      ]
    );

    return mandate;
  }

  async getMandate(mandateId: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM payment_mandates WHERE mandate_id = $1',
      [mandateId]
    );
    return result.rows[0];
  }

  async verifyMandate(mandate: Mandate, agentKey: string): Promise<boolean> {
    const ap2 = new AP2Protocol(
      this.bridgeService['bridgeClient'],
      { agentId: mandate.agent_id, agentKey }
    );
    return ap2.verifyMandate(mandate);
  }

  // Multi-Agent Consensus Transactions
  async initiateConsensusTransaction(
    initiatorAgentId: string,
    validatorAgentIds: string[],
    amount: number,
    currency: string,
    requiredVotes?: number,
    metadata?: any
  ): Promise<MultiAgentTransaction> {
    // Verify initiator agent
    const initiator = await this.getAgent(initiatorAgentId);
    if (!initiator || !initiator.is_active) {
      throw new Error('Initiator agent not found or inactive');
    }

    // Verify all validator agents exist and are active
    for (const validatorId of validatorAgentIds) {
      const validator = await this.getAgent(validatorId);
      if (!validator || !validator.is_active) {
        throw new Error(`Validator agent ${validatorId} not found or inactive`);
      }
    }

    // Calculate required votes (Byzantine threshold)
    const votes = requiredVotes || Math.ceil(validatorAgentIds.length * 0.67);

    // Create transaction record
    const result = await this.db.query(
      `INSERT INTO consensus_transactions 
       (transaction_id, initiator_agent_id, amount, currency, required_votes, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        initiatorAgentId,
        amount,
        currency,
        votes,
        'pending',
        JSON.stringify(metadata || {})
      ]
    );

    const transaction = result.rows[0];

    // Validate security requirements
    const validation = this.securityManager.validateTransactionSecurity({
      transaction_id: transaction.transaction_id,
      initiator_agent: initiatorAgentId,
      validator_agents: validatorAgentIds,
      required_votes: votes,
      consensus_votes: [],
      status: 'pending',
      amount,
      currency
    });

    if (!validation.valid) {
      throw new Error(`Transaction security validation failed: ${validation.errors.join(', ')}`);
    }

    return {
      transaction_id: transaction.transaction_id,
      initiator_agent: initiatorAgentId,
      validator_agents: validatorAgentIds,
      required_votes: votes,
      consensus_votes: [],
      status: 'pending',
      amount,
      currency
    };
  }

  async addConsensusVote(
    transactionId: string,
    validatorAgentId: string,
    vote: boolean,
    signature: string
  ): Promise<any> {
    // Get transaction
    const txnResult = await this.db.query(
      'SELECT * FROM consensus_transactions WHERE transaction_id = $1',
      [transactionId]
    );

    if (txnResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = txnResult.rows[0];

    if (transaction.status !== 'pending') {
      throw new Error('Transaction is not in pending status');
    }

    // Verify validator agent
    const validator = await this.getAgent(validatorAgentId);
    if (!validator || !validator.is_active) {
      throw new Error('Validator agent not found or inactive');
    }

    // Check if already voted
    const existingVote = await this.db.query(
      'SELECT * FROM consensus_votes WHERE consensus_transaction_id = $1 AND validator_agent_id = $2',
      [transaction.id, validatorAgentId]
    );

    if (existingVote.rows.length > 0) {
      throw new Error('Agent has already voted on this transaction');
    }

    // Store vote
    await this.db.query(
      `INSERT INTO consensus_votes 
       (consensus_transaction_id, validator_agent_id, vote, signature)
       VALUES ($1, $2, $3, $4)`,
      [transaction.id, validatorAgentId, vote, signature]
    );

    // Get all votes
    const votesResult = await this.db.query(
      'SELECT * FROM consensus_votes WHERE consensus_transaction_id = $1',
      [transaction.id]
    );

    const votes = votesResult.rows;
    const positiveVotes = votes.filter(v => v.vote).length;

    // Check if consensus reached
    let newStatus = transaction.status;
    if (positiveVotes >= transaction.required_votes) {
      newStatus = 'authorized';
    } else if (votes.length >= transaction.required_votes && positiveVotes < transaction.required_votes) {
      newStatus = 'failed';
    }

    // Update transaction status
    if (newStatus !== transaction.status) {
      await this.db.query(
        'UPDATE consensus_transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStatus, transaction.id]
      );
    }

    return {
      transaction_id: transactionId,
      status: newStatus,
      total_votes: votes.length,
      positive_votes: positiveVotes,
      required_votes: transaction.required_votes
    };
  }

  async executeConsensusTransaction(
    transactionId: string,
    fromWalletId: string,
    toWalletId: string
  ): Promise<any> {
    // Get transaction
    const txnResult = await this.db.query(
      'SELECT * FROM consensus_transactions WHERE transaction_id = $1',
      [transactionId]
    );

    if (txnResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = txnResult.rows[0];

    if (transaction.status !== 'authorized') {
      throw new Error('Transaction not authorized for execution');
    }

    // Get initiator agent's customer
    const agent = await this.getAgent(transaction.initiator_agent_id);
    const userResult = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [agent.user_id]
    );

    const customerResult = await this.db.query(
      'SELECT * FROM bridge_customers WHERE user_id = $1',
      [agent.user_id]
    );

    if (customerResult.rows.length === 0) {
      throw new Error('Customer not found for agent');
    }

    const customer = customerResult.rows[0];

    // Execute transfer through Bridge
    const transfer = await this.bridgeService.createTransfer(
      customer.bridge_customer_id,
      fromWalletId,
      toWalletId,
      transaction.amount,
      transaction.currency
    );

    // Update consensus transaction
    await this.db.query(
      `UPDATE consensus_transactions 
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP, bridge_transaction_id = $1
       WHERE id = $2`,
      [transfer.id, transaction.id]
    );

    // Log agent action
    await this.db.query(
      `INSERT INTO agent_actions 
       (agent_id, action_type, amount, currency, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        transaction.initiator_agent_id,
        'consensus_payment',
        transaction.amount,
        transaction.currency,
        'completed',
        JSON.stringify({ transaction_id: transactionId, transfer_id: transfer.id })
      ]
    );

    return {
      transaction_id: transactionId,
      transfer_id: transfer.id,
      status: 'completed',
      amount: transaction.amount,
      currency: transaction.currency
    };
  }

  // Agent Actions Log
  async logAgentAction(
    agentId: string,
    actionType: string,
    amount?: number,
    currency?: string,
    status: string = 'completed',
    metadata?: any
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO agent_actions 
       (agent_id, action_type, amount, currency, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [agentId, actionType, amount, currency, status, JSON.stringify(metadata || {})]
    );
  }

  async getAgentActions(agentId: string, limit: number = 50): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM agent_actions WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2',
      [agentId, limit]
    );
    return result.rows;
  }

  // Agent Spending Summary
  async getAgentSpendingSummary(agentId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
         agent_name,
         spending_limit,
         spent_amount,
         (spending_limit - spent_amount) as remaining_limit,
         COUNT(aa.id) as total_actions,
         SUM(CASE WHEN aa.status = 'completed' THEN aa.amount ELSE 0 END) as total_spent
       FROM ai_agents a
       LEFT JOIN agent_actions aa ON a.id = aa.agent_id
       WHERE a.id = $1
       GROUP BY a.id, a.agent_name, a.spending_limit, a.spent_amount`,
      [agentId]
    );
    return result.rows[0];
  }
}
