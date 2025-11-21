/**
 * Main API Entry Point
 */
import express from 'express';
import { Pool } from 'pg';
import { BridgeService } from '../services/bridge-service';
import { AP2Service } from '../services/ap2-service';
import { PaymentService } from '../services/payment-service';
import { AgentService } from '../services/agent-service';
import { createCustomerRoutes } from './routes/customers';
import { createPaymentRoutes } from './routes/payments';
import { createAgentRoutes } from './routes/agents';
import { createMerchantRoutes } from './routes/merchants';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { errorHandler } from '../middleware/error-handler';

export function createApp(config: {
  bridgeApiKey: string;
  bridgeEnvironment: 'sandbox' | 'production';
  databaseUrl: string;
}) {
  const app = express();

  // Database connection
  const db = new Pool({
    connectionString: config.databaseUrl
  });

  // Initialize services
  const bridgeService = new BridgeService(
    config.bridgeApiKey,
    config.bridgeEnvironment,
    db
  );
  const paymentService = new PaymentService(db, bridgeService);
  const agentService = new AgentService(db);
  const ap2Service = new AP2Service(db, bridgeService);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/customers', authMiddleware, createCustomerRoutes(bridgeService));
  app.use('/api/payments', authMiddleware, createPaymentRoutes(bridgeService, paymentService));
  app.use('/api/agents', authMiddleware, createAgentRoutes(ap2Service, agentService));
  app.use('/api/merchants', createMerchantRoutes(bridgeService, db));

  // Webhook endpoint (no auth required)
  app.post('/webhooks/bridge', express.json(), async (req, res) => {
    try {
      await bridgeService.processWebhook(req.body.type, req.body.data);
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return { app, db, services: { bridgeService, paymentService, agentService, ap2Service } };
}

// Start server if run directly
if (require.main === module) {
  const config = {
    bridgeApiKey: process.env.BRIDGE_API_KEY!,
    bridgeEnvironment: (process.env.BRIDGE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    databaseUrl: process.env.DATABASE_URL!
  };

  const { app } = createApp(config);
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Bridge API server listening on port ${port}`);
  });
}
