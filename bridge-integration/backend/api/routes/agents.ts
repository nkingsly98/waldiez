/**
 * Agent API Routes
 */
import { Router } from 'express';
import { AP2Service } from '../../services/ap2-service';
import { AgentService } from '../../services/agent-service';

export function createAgentRoutes(
  ap2Service: AP2Service,
  agentService: AgentService
): Router {
  const router = Router();

  // Register agent
  router.post('/', async (req, res) => {
    try {
      const { userId, agentName, agentType, publicKey, role, walletId, spendingLimit, config } = req.body;
      const agent = await ap2Service.registerAgent(
        userId,
        agentName,
        agentType,
        publicKey,
        role,
        walletId,
        spendingLimit,
        config
      );
      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get agent
  router.get('/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const agent = await agentService.getAgent(agentId);
      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // List user agents
  router.get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const agents = await agentService.listAgents(userId);
      res.json({ success: true, data: agents });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update agent
  router.patch('/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const agent = await agentService.updateAgent(agentId, req.body);
      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create mandate
  router.post('/:agentId/mandates', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { agentKey, mandateType, amount, currency, description, expiryHours, metadata } = req.body;
      const mandate = await ap2Service.createMandate(
        agentId,
        agentKey,
        mandateType,
        amount,
        currency,
        description,
        expiryHours,
        metadata
      );
      res.json({ success: true, data: mandate });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Initiate consensus transaction
  router.post('/consensus/initiate', async (req, res) => {
    try {
      const { initiatorAgentId, validatorAgentIds, amount, currency, requiredVotes, metadata } = req.body;
      const transaction = await ap2Service.initiateConsensusTransaction(
        initiatorAgentId,
        validatorAgentIds,
        amount,
        currency,
        requiredVotes,
        metadata
      );
      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Add consensus vote
  router.post('/consensus/:transactionId/vote', async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { validatorAgentId, vote, signature } = req.body;
      const result = await ap2Service.addConsensusVote(
        transactionId,
        validatorAgentId,
        vote,
        signature
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute consensus transaction
  router.post('/consensus/:transactionId/execute', async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { fromWalletId, toWalletId } = req.body;
      const result = await ap2Service.executeConsensusTransaction(
        transactionId,
        fromWalletId,
        toWalletId
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get agent actions
  router.get('/:agentId/actions', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { limit } = req.query;
      const actions = await ap2Service.getAgentActions(agentId, Number(limit) || 50);
      res.json({ success: true, data: actions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get agent spending summary
  router.get('/:agentId/spending', async (req, res) => {
    try {
      const { agentId } = req.params;
      const summary = await ap2Service.getAgentSpendingSummary(agentId);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
