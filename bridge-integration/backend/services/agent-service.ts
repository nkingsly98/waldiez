/**
 * Agent Service
 * Manages AI agents and their configurations
 */
import { Pool } from 'pg';
import type { AgentRole } from '../../sdk/typescript/src/types';

export class AgentService {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async createAgent(
    userId: string,
    agentName: string,
    agentType: string,
    publicKey: string,
    role: AgentRole,
    config?: any
  ): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO ai_agents 
       (user_id, agent_name, agent_type, public_key, role, config)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, agentName, agentType, publicKey, role, JSON.stringify(config || {})]
    );
    return result.rows[0];
  }

  async getAgent(agentId: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM ai_agents WHERE id = $1',
      [agentId]
    );
    return result.rows[0];
  }

  async listAgents(userId: string): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM ai_agents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async updateAgent(agentId: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await this.getAgent(agentId);
    }

    values.push(agentId);
    const query = `UPDATE ai_agents SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    await this.db.query('DELETE FROM ai_agents WHERE id = $1', [agentId]);
    return true;
  }

  async linkWallet(agentId: string, walletId: string): Promise<void> {
    await this.db.query(
      'UPDATE ai_agents SET wallet_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [walletId, agentId]
    );
  }

  async setSpendingLimit(agentId: string, limit: number): Promise<void> {
    await this.db.query(
      'UPDATE ai_agents SET spending_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [limit, agentId]
    );
  }
}
