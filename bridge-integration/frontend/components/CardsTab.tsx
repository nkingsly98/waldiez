/**
 * Cards Tab Component
 */
import React, { useState } from 'react';

export default function CardsTab() {
  const [cards, setCards] = useState<any[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [cardType, setCardType] = useState('virtual');
  const [spendingLimit, setSpendingLimit] = useState('1000');

  const handleIssueCard = async () => {
    // In real app, call API
    console.log('Issuing card:', { cardType, spendingLimit });
    setShowIssueModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Cards</h2>
        <button
          onClick={() => setShowIssueModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Issue Card
        </button>
      </div>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-8">
                <span className="text-sm opacity-80">{card.card_type}</span>
                <span className="text-sm opacity-80">{card.brand}</span>
              </div>

              <div className="mb-6">
                <div className="font-mono text-2xl tracking-wider">
                  •••• •••• •••• {card.last_four}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-80">Limit</div>
                  <div className="font-semibold">${card.spending_limit}</div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm hover:bg-opacity-30">
                    Freeze
                  </button>
                  <button className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm hover:bg-opacity-30">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-500 mb-4">No cards yet</p>
          <button
            onClick={() => setShowIssueModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Issue Your First Card
          </button>
        </div>
      )}

      {/* Issue Card Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Issue New Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Type
                </label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="virtual">Virtual Card</option>
                  <option value="physical">Physical Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spending Limit (USD)
                </label>
                <input
                  type="number"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="1000"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  {cardType === 'virtual' 
                    ? 'Virtual cards are issued instantly and can be used online immediately.'
                    : 'Physical cards will be mailed to your address and take 7-10 business days.'}
                </p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueCard}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Issue Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
