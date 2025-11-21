/**
 * AI Agents Tab Component
 */
import React, { useState, useEffect } from 'react';
import { bridgeClient } from '../lib/bridge-client';

export default function AgentsTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    agentName: '',
    agentType: 'payment',
    role: 'initiator',
    spendingLimit: '1000'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await bridgeClient.listAgents('user_id');
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const handleCreateAgent = async () => {
    setLoading(true);
    try {
      await bridgeClient.registerAgent(
        'user_id',
        newAgent.agentName,
        newAgent.agentType,
        'public_key_placeholder', // Should be generated
        newAgent.role,
        { spendingLimit: parseFloat(newAgent.spendingLimit) }
      );
      setShowCreateModal(false);
      loadAgents();
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Agents</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Register Agent
        </button>
      </div>

      {agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  agent.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2">{agent.agent_name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{agent.agent_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-medium capitalize">{agent.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spending Limit:</span>
                  <span className="font-medium">${agent.spending_limit || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span className="font-medium">${agent.spent_amount || 0}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 text-sm">
                  Configure
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 py-2 rounded hover:bg-gray-100 text-sm">
                  View Actions
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-500 mb-4">No AI agents configured</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Register Your First Agent
          </button>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Register AI Agent</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={newAgent.agentName}
                  onChange={(e) => setNewAgent({ ...newAgent, agentName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="My Payment Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Type
                </label>
                <select
                  value={newAgent.agentType}
                  onChange={(e) => setNewAgent({ ...newAgent, agentType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="payment">Payment Agent</option>
                  <option value="validator">Validator Agent</option>
                  <option value="executor">Executor Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="initiator">Initiator</option>
                  <option value="validator">Validator</option>
                  <option value="executor">Executor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spending Limit (USD)
                </label>
                <input
                  type="number"
                  value={newAgent.spendingLimit}
                  onChange={(e) => setNewAgent({ ...newAgent, spendingLimit: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="1000"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> AI agents can autonomously execute payments within their spending limits.
                  Use Byzantine fault tolerance for critical transactions.
                </p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
