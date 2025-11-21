/**
 * Transfers Tab Component
 */
import React, { useState } from 'react';
import { bridgeClient } from '../lib/bridge-client';

interface TransfersTabProps {
  wallets: any[];
}

export default function TransfersTab({ wallets }: TransfersTabProps) {
  const [activeAction, setActiveAction] = useState<'send' | 'on-ramp' | 'off-ramp'>('send');
  const [formData, setFormData] = useState({
    fromWallet: '',
    toWallet: '',
    amount: '',
    paymentMethod: 'bank_account'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    setLoading(true);
    try {
      const transfer = await bridgeClient.createTransfer(
        'customer_id',
        formData.fromWallet,
        formData.toWallet,
        parseFloat(formData.amount),
        'USD'
      );
      setResult({ success: true, data: transfer });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOnRamp = async () => {
    setLoading(true);
    try {
      const result = await bridgeClient.onRamp(
        'customer_id',
        formData.toWallet,
        parseFloat(formData.amount),
        'USD',
        formData.paymentMethod
      );
      setResult({ success: true, data: result });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOffRamp = async () => {
    setLoading(true);
    try {
      const result = await bridgeClient.offRamp(
        'customer_id',
        formData.fromWallet,
        parseFloat(formData.amount),
        'USD',
        'bank_account_id'
      );
      setResult({ success: true, data: result });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAction === 'send') handleSend();
    else if (activeAction === 'on-ramp') handleOnRamp();
    else handleOffRamp();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Transfers</h2>

      {/* Action Tabs */}
      <div className="flex space-x-4 mb-6">
        {['send', 'on-ramp', 'off-ramp'].map((action) => (
          <button
            key={action}
            onClick={() => setActiveAction(action as any)}
            className={`px-4 py-2 rounded-md font-medium ${
              activeAction === action
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {action.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeAction === 'send' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Wallet
              </label>
              <select
                value={formData.fromWallet}
                onChange={(e) => setFormData({ ...formData, fromWallet: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.bridge_wallet_id}>
                    {w.currency} - Balance: {w.balance}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Wallet
              </label>
              <input
                type="text"
                value={formData.toWallet}
                onChange={(e) => setFormData({ ...formData, toWallet: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Wallet address or ID"
                required
              />
            </div>
          </>
        )}

        {activeAction === 'on-ramp' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Wallet
              </label>
              <select
                value={formData.toWallet}
                onChange={(e) => setFormData({ ...formData, toWallet: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.bridge_wallet_id}>
                    {w.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="bank_account">Bank Account</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>
          </>
        )}

        {activeAction === 'off-ramp' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Wallet
            </label>
            <select
              value={formData.fromWallet}
              onChange={(e) => setFormData({ ...formData, fromWallet: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select wallet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.bridge_wallet_id}>
                  {w.currency} - Balance: {w.balance}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="0.00"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Submit Transfer'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {result.success ? 'Transfer initiated successfully!' : `Error: ${result.error}`}
        </div>
      )}
    </div>
  );
}
