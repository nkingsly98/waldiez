/**
 * Merchant Dashboard
 */
import React from 'react';

export default function MerchantDashboard() {
  const stats = {
    totalVolume: 125430.50,
    transactions: 342,
    customers: 87,
    avgTransaction: 366.78
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Total Volume</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${stats.totalVolume.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-2">+12.5% vs last month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Transactions</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.transactions}
            </div>
            <div className="text-sm text-green-600 mt-2">+8.2% vs last month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Customers</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.customers}
            </div>
            <div className="text-sm text-blue-600 mt-2">Active customers</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Avg Transaction</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${stats.avgTransaction.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-2">Per transaction</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-50 text-blue-700 p-4 rounded-lg hover:bg-blue-100 text-left">
              <div className="text-2xl mb-2">💳</div>
              <div className="font-semibold">Create Payment Link</div>
            </button>
            <button className="bg-green-50 text-green-700 p-4 rounded-lg hover:bg-green-100 text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">View Analytics</div>
            </button>
            <button className="bg-purple-50 text-purple-700 p-4 rounded-lg hover:bg-purple-100 text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold">API Settings</div>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              No recent transactions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
