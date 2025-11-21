/**
 * Customer API Routes
 */
import { Router } from 'express';
import { BridgeService } from '../../services/bridge-service';

export function createCustomerRoutes(bridgeService: BridgeService): Router {
  const router = Router();

  // Create customer
  router.post('/', async (req, res) => {
    try {
      const { userId, email, firstName, lastName } = req.body;
      const customer = await bridgeService.createCustomer(userId, email, firstName, lastName);
      res.json({ success: true, data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get customer
  router.get('/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await bridgeService.getCustomer(customerId);
      res.json({ success: true, data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Start KYC
  router.post('/:customerId/kyc', async (req, res) => {
    try {
      const { customerId } = req.params;
      const result = await bridgeService.startKYCProcess(customerId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create wallet
  router.post('/:customerId/wallets', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { currency, walletType } = req.body;
      const wallet = await bridgeService.createWallet(customerId, currency, walletType);
      res.json({ success: true, data: wallet });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // List wallets
  router.get('/:customerId/wallets', async (req, res) => {
    try {
      const { customerId } = req.params;
      const wallets = await bridgeService.listWallets(customerId);
      res.json({ success: true, data: wallets });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Issue card
  router.post('/:customerId/cards', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { cardType, spendingLimit } = req.body;
      const card = await bridgeService.issueCard(customerId, cardType, spendingLimit);
      res.json({ success: true, data: card });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Add external account
  router.post('/:customerId/external-accounts', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { accountNumber, routingNumber, accountType } = req.body;
      const account = await bridgeService.addExternalAccount(
        customerId,
        accountNumber,
        routingNumber,
        accountType
      );
      res.json({ success: true, data: account });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
