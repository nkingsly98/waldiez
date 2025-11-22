/**
 * Payment API Routes
 */
import { Router } from 'express';
import { BridgeService } from '../../services/bridge-service';
import { PaymentService } from '../../services/payment-service';

export function createPaymentRoutes(
  bridgeService: BridgeService,
  paymentService: PaymentService
): Router {
  const router = Router();

  // Create transfer
  router.post('/transfers', async (req, res) => {
    try {
      const { customerId, fromWalletId, toWalletId, amount, currency } = req.body;
      const transfer = await paymentService.processPayment(
        customerId,
        fromWalletId,
        toWalletId,
        amount,
        currency
      );
      res.json({ success: true, data: transfer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get transfer status
  router.get('/transfers/:transferId', async (req, res) => {
    try {
      const { transferId } = req.params;
      const transfer = await paymentService.getPaymentStatus(transferId);
      res.json({ success: true, data: transfer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // On-ramp
  router.post('/on-ramp', async (req, res) => {
    try {
      const { customerId, walletId, amount, currency, paymentMethod } = req.body;
      const result = await bridgeService.onRamp(
        customerId,
        walletId,
        amount,
        currency,
        paymentMethod
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Off-ramp
  router.post('/off-ramp', async (req, res) => {
    try {
      const { customerId, walletId, amount, currency, destinationAccount } = req.body;
      const result = await bridgeService.offRamp(
        customerId,
        walletId,
        amount,
        currency,
        destinationAccount
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Estimate fees
  router.post('/estimate-fees', async (req, res) => {
    try {
      const { amount, currency, type } = req.body;
      const estimate = await paymentService.estimateFees(amount, currency, type);
      res.json({ success: true, data: estimate });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Transaction history
  router.get('/history/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { limit } = req.query;
      const history = await paymentService.listPayments(customerId, Number(limit) || 50);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
