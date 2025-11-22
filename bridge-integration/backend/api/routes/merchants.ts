/**
 * Merchant API Routes
 */
import { Router } from 'express';
import { Pool } from 'pg';
import { BridgeService } from '../../services/bridge-service';

export function createMerchantRoutes(bridgeService: BridgeService, db: Pool): Router {
  const router = Router();

  // Register merchant
  router.post('/register', async (req, res) => {
    try {
      const { userId, businessName, businessType, taxId, address } = req.body;

      // Create merchant record
      const result = await db.query(
        `INSERT INTO users (email, first_name, last_name, role)
         VALUES ($1, $2, $3, 'merchant')
         RETURNING *`,
        [req.body.email, businessName, '', ]
      );

      const merchant = result.rows[0];

      // Create Bridge customer for merchant
      const customer = await bridgeService.createCustomer(
        merchant.id,
        req.body.email,
        businessName
      );

      res.json({ success: true, data: { merchant, customer } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get merchant dashboard data
  router.get('/:merchantId/dashboard', async (req, res) => {
    try {
      const { merchantId } = req.params;

      // Get merchant's customer
      const customerResult = await db.query(
        'SELECT * FROM bridge_customers WHERE user_id = $1',
        [merchantId]
      );

      if (customerResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Merchant not found' });
      }

      const customer = customerResult.rows[0];

      // Get wallets
      const wallets = await bridgeService.listWallets(customer.bridge_customer_id);

      // Get transactions
      const transactions = await bridgeService.getTransactionHistory(customer.bridge_customer_id, 10);

      res.json({
        success: true,
        data: {
          customer,
          wallets,
          transactions
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
