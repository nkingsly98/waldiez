/**
 * Validation Middleware
 */
import { Request, Response, NextFunction } from 'express';

export function validateCustomerCreate(req: Request, res: Response, next: NextFunction) {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
}

export function validateTransfer(req: Request, res: Response, next: NextFunction) {
  const { customerId, fromWalletId, toWalletId, amount, currency } = req.body;

  if (!customerId || !fromWalletId || !toWalletId || !amount || !currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  next();
}

export function validateAgent(req: Request, res: Response, next: NextFunction) {
  const { userId, agentName, agentType, publicKey, role } = req.body;

  if (!userId || !agentName || !agentType || !publicKey || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validRoles = ['initiator', 'validator', 'executor'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid agent role' });
  }

  next();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const validationMiddleware = {
  validateCustomerCreate,
  validateTransfer,
  validateAgent
};
