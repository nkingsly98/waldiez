/**
 * Main Dashboard Page
 */
import React, { useState, useEffect } from 'react';
import { bridgeClient } from '../lib/bridge-client';
import WalletsTab from '../components/WalletsTab';
import TransfersTab from '../components/TransfersTab';
import CardsTab from '../components/CardsTab';
import AgentsTab from '../components/AgentsTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [customer, setCustomer] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real app, get customer ID from auth context
      const customerId = 'customer_id';
      const customerData = await bridgeClient.getCustomer(customerId);
      const walletsData = await bridgeClient.listWallets(customerId);
      const txHistory = await bridgeClient.getTransactionHistory(customerId, 10);

      setCustomer(customerData);
      setWallets(walletsData);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Bridge Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total Balance</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  ${totalBalance.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Active Wallets</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {wallets.length}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Transactions</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {transactions.length}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>
              <div className="p-6">
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <div className="font-medium">{tx.transaction_type}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {tx.amount} {tx.currency}
                          </div>
                          <div className={`text-sm ${
                            tx.status === 'completed' ? 'text-green-600' :
                            tx.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {tx.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {['overview', 'wallets', 'transfers', 'cards', 'agents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'wallets' && <WalletsTab wallets={wallets} onRefresh={loadDashboardData} />}
        {activeTab === 'transfers' && <TransfersTab wallets={wallets} />}
        {activeTab === 'cards' && <CardsTab />}
        {activeTab === 'agents' && <AgentsTab />}
      </main>
    </div>
  );
}
