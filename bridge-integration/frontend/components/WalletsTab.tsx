/**
 * Wallets Tab Component
 */
import React, { useState } from 'react';
import { bridgeClient } from '../lib/bridge-client';

interface WalletsTabProps {
  wallets: any[];
  onRefresh: () => void;
}

export default function WalletsTab({ wallets, onRefresh }: WalletsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWallet, setNewWallet] = useState({ currency: 'USD', walletType: 'crypto' });
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      await bridgeClient.createWallet(
        'customer_id', // Should come from context
        newWallet.currency,
        newWallet.walletType
      );
      setShowCreateModal(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Wallets</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create Wallet
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {wallet.wallet_type}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                wallet.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {wallet.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {wallet.balance.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">{wallet.currency}</div>
            </div>

            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 mb-1">Address</div>
              <div className="font-mono text-sm truncate">{wallet.address}</div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100">
                Receive
              </button>
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100">
                Send
              </button>
            </div>
          </div>
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No wallets yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Create Your First Wallet
          </button>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Wallet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={newWallet.currency}
                  onChange={(e) => setNewWallet({ ...newWallet, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Type
                </label>
                <select
                  value={newWallet.walletType}
                  onChange={(e) => setNewWallet({ ...newWallet, walletType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="crypto">Crypto</option>
                  <option value="liquidity">Liquidity</option>
                </select>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWallet}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
