# Usage Examples

Comprehensive examples for using the Bridge API integration.

## Table of Contents

- [Python SDK Examples](#python-sdk-examples)
- [TypeScript SDK Examples](#typescript-sdk-examples)
- [REST API Examples](#rest-api-examples)
- [Frontend Integration](#frontend-integration)
- [Multi-Agent Workflows](#multi-agent-workflows)

## Python SDK Examples

### Basic Setup

```python
import os
from bridge_sdk import create_bridge_client
from ap2_integration import AP2Protocol, MandateType
from datetime import datetime, timedelta

# Initialize Bridge client
bridge = create_bridge_client(
    api_key=os.getenv('BRIDGE_API_KEY'),
    environment='sandbox'
)
```

### Customer Management

```python
# Create a new customer
customer = bridge.create_customer(
    email='user@example.com',
    first_name='Jane',
    last_name='Doe',
    metadata={'source': 'web_app'}
)

print(f"Customer created: {customer.id}")

# Start KYC verification
kyc_result = bridge.start_kyc(customer.id)
print(f"KYC status: {kyc_result['status']}")

# Get customer details
customer_info = bridge.get_customer(customer.id)
print(f"KYC status: {customer_info.kyc_status}")
```

### Wallet Operations

```python
# Create a crypto wallet
wallet = bridge.create_wallet(
    customer_id=customer.id,
    currency='USDC',
    wallet_type='crypto'
)

print(f"Wallet created: {wallet.id}")
print(f"Address: {wallet.address}")

# List all wallets
wallets = bridge.list_wallets(customer.id)
for w in wallets:
    print(f"{w.currency}: {w.balance}")

# Get wallet balance
balance = bridge.get_wallet_balance(wallet.id)
print(f"Current balance: {balance}")
```

### Payment Processing

```python
# Create a transfer
transfer = bridge.create_transfer(
    from_wallet_id='wallet_abc123',
    to_wallet_id='wallet_def456',
    amount=100.50,
    currency='USD'
)

print(f"Transfer ID: {transfer.id}")
print(f"Status: {transfer.status}")

# Check transfer status
transfer_status = bridge.get_transfer(transfer.id)
print(f"Transfer status: {transfer_status.status}")

# On-ramp (fiat to crypto)
on_ramp_result = bridge.on_ramp(
    customer_id=customer.id,
    wallet_id=wallet.id,
    amount=1000.00,
    currency='USD',
    payment_method='bank_account'
)

# Off-ramp (crypto to fiat)
off_ramp_result = bridge.off_ramp(
    customer_id=customer.id,
    wallet_id=wallet.id,
    amount=500.00,
    currency='USD',
    destination_account='account_xyz789'
)
```

### Card Management

```python
# Issue a virtual card
card = bridge.issue_card(
    customer_id=customer.id,
    card_type='virtual',
    spending_limit=5000.00
)

print(f"Card issued: {card.id}")
print(f"Last four: {card.last_four}")

# Freeze a card
bridge.freeze_card(card.id)
print("Card frozen")

# Cancel a card
bridge.cancel_card(card.id)
print("Card cancelled")
```

### AP2 Protocol - Payment Mandates

```python
# Initialize AP2 protocol
ap2 = AP2Protocol(
    bridge_sdk=bridge,
    agent_id='agent_001',
    agent_key=os.getenv('AGENT_KEY')
)

# Create a payment mandate
mandate = ap2.create_mandate(
    mandate_type=MandateType.INTENT,
    amount=250.00,
    currency='USD',
    description='Monthly subscription payment',
    expiry=datetime.now() + timedelta(days=30),
    metadata={'subscription_id': 'sub_123'}
)

print(f"Mandate created: {mandate.id}")

# Verify mandate
is_valid = ap2.verify_mandate(mandate)
print(f"Mandate valid: {is_valid}")
```

### Multi-Agent Consensus

```python
# Initiate consensus transaction
transaction = ap2.initiate_multi_agent_transaction(
    validator_agents=['agent_002', 'agent_003', 'agent_004'],
    amount=1000.00,
    currency='USD',
    required_votes=3  # Need 3 out of 3 validators
)

print(f"Transaction ID: {transaction.transaction_id}")

# Add validator votes
for validator_id in ['agent_002', 'agent_003']:
    signature = ap2.create_agent_signature({
        'transaction_id': transaction.transaction_id,
        'validator_id': validator_id
    })
    
    transaction = ap2.add_consensus_vote(
        transaction=transaction,
        agent_id=validator_id,
        vote=True,
        agent_signature=signature
    )

print(f"Transaction status: {transaction.status}")

# Execute if authorized
if transaction.status == 'authorized':
    result = ap2.execute_multi_agent_transaction(
        transaction=transaction,
        from_wallet_id='wallet_abc',
        to_wallet_id='wallet_def'
    )
    print(f"Execution result: {result}")
```

## TypeScript SDK Examples

### Basic Setup

```typescript
import { createBridgeClient, AP2Protocol } from '@bridge/sdk';

// Initialize Bridge client
const bridge = createBridgeClient(
  process.env.BRIDGE_API_KEY,
  'sandbox'
);
```

### Customer and Wallet Management

```typescript
// Create customer
const customer = await bridge.createCustomer(
  'user@example.com',
  'John',
  'Smith'
);

console.log(`Customer created: ${customer.id}`);

// Create wallet
const wallet = await bridge.createWallet(
  customer.id,
  'ETH',
  'crypto'
);

console.log(`Wallet: ${wallet.address}`);

// List wallets
const wallets = await bridge.listWallets(customer.id);
wallets.forEach(w => {
  console.log(`${w.currency}: ${w.balance}`);
});
```

### Async Payment Processing

```typescript
async function processPayment(
  fromWallet: string,
  toWallet: string,
  amount: number
) {
  try {
    const transfer = await bridge.createTransfer(
      fromWallet,
      toWallet,
      amount,
      'USD'
    );

    console.log(`Transfer initiated: ${transfer.id}`);

    // Poll for completion
    let status = transfer.status;
    while (status === 'pending') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updated = await bridge.getTransfer(transfer.id);
      status = updated.status;
    }

    console.log(`Transfer ${status}`);
    return transfer;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

### AP2 Multi-Agent Transaction

```typescript
import { AP2Protocol } from '@bridge/sdk';

const ap2 = new AP2Protocol(bridge, {
  agentId: 'agent_001',
  agentKey: process.env.AGENT_KEY!
});

// Create mandate
const mandate = ap2.createMandate(
  'intent',
  500.0,
  'USD',
  'Service payment',
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
);

// Initiate consensus
const transaction = ap2.initiateMultiAgentTransaction(
  ['agent_002', 'agent_003'],
  500.0,
  'USD',
  2 // Require 2 votes
);

// Add votes
const signature = ap2.createAgentSignature({
  transactionId: transaction.transaction_id,
  validatorId: 'agent_002'
});

ap2.addConsensusVote(
  transaction,
  'agent_002',
  true,
  signature
);

// Execute when authorized
if (transaction.status === 'authorized') {
  const result = await ap2.executeMultiAgentTransaction(
    transaction,
    'wallet_from',
    'wallet_to'
  );
  console.log('Transaction executed:', result);
}
```

## REST API Examples

### Authentication

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIs..."}
```

### Customer Operations

```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "email": "customer@example.com",
    "firstName": "Alice",
    "lastName": "Johnson"
  }'

# Start KYC
curl -X POST http://localhost:3000/api/customers/cust_abc/kyc \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create wallet
curl -X POST http://localhost:3000/api/customers/cust_abc/wallets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USDC",
    "walletType": "crypto"
  }'
```

### Payment Operations

```bash
# Create transfer
curl -X POST http://localhost:3000/api/payments/transfers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_abc",
    "fromWalletId": "wallet_123",
    "toWalletId": "wallet_456",
    "amount": 150.00,
    "currency": "USD"
  }'

# On-ramp
curl -X POST http://localhost:3000/api/payments/on-ramp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_abc",
    "walletId": "wallet_123",
    "amount": 2000.00,
    "currency": "USD",
    "paymentMethod": "bank_account"
  }'

# Get transaction history
curl http://localhost:3000/api/payments/history/cust_abc?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Agent Operations

```bash
# Register agent
curl -X POST http://localhost:3000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "agentName": "Payment Bot",
    "agentType": "payment",
    "publicKey": "pk_abc123...",
    "role": "initiator",
    "spendingLimit": 5000.00
  }'

# Initiate consensus transaction
curl -X POST http://localhost:3000/api/agents/consensus/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "initiatorAgentId": "agent_001",
    "validatorAgentIds": ["agent_002", "agent_003"],
    "amount": 750.00,
    "currency": "USD"
  }'

# Add vote
curl -X POST http://localhost:3000/api/agents/consensus/txn_123/vote \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "validatorAgentId": "agent_002",
    "vote": true,
    "signature": "sig_abc..."
  }'
```

## Frontend Integration

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { bridgeClient } from '../lib/bridge-client';

function WalletManager({ customerId }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, [customerId]);

  const loadWallets = async () => {
    try {
      const data = await bridgeClient.listWallets(customerId);
      setWallets(data);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (currency: string) => {
    try {
      await bridgeClient.createWallet(customerId, currency);
      loadWallets();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Wallets</h2>
      {wallets.map(wallet => (
        <div key={wallet.id}>
          <p>{wallet.currency}: {wallet.balance}</p>
        </div>
      ))}
      <button onClick={() => createWallet('USDC')}>
        Add USDC Wallet
      </button>
    </div>
  );
}
```

### Custom React Hook

```typescript
import { useState, useEffect } from 'react';
import { bridgeClient } from '../lib/bridge-client';

export function useWallets(customerId: string) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWallets();
  }, [customerId]);

  const loadWallets = async () => {
    try {
      const data = await bridgeClient.listWallets(customerId);
      setWallets(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (currency: string) => {
    const wallet = await bridgeClient.createWallet(customerId, currency);
    setWallets([...wallets, wallet]);
    return wallet;
  };

  return { wallets, loading, error, createWallet, refresh: loadWallets };
}

// Usage
function MyComponent({ customerId }) {
  const { wallets, loading, createWallet } = useWallets(customerId);
  
  // Use wallets data...
}
```

## Multi-Agent Workflows

### Automated Payment with Fallback

```python
def execute_payment_with_consensus(
    initiator: AP2Protocol,
    validators: list,
    amount: float,
    from_wallet: str,
    to_wallet: str
):
    """Execute payment with multi-agent consensus and fallback"""
    
    # Try consensus first
    transaction = initiator.initiate_multi_agent_transaction(
        validator_agents=validators,
        amount=amount,
        currency='USD'
    )
    
    # Collect votes
    for validator in validators:
        # In real implementation, validators would vote independently
        vote_result = get_validator_vote(validator, transaction)
        transaction = initiator.add_consensus_vote(
            transaction=transaction,
            agent_id=validator,
            vote=vote_result['vote'],
            agent_signature=vote_result['signature']
        )
    
    # Execute if authorized
    if transaction.status == 'authorized':
        return initiator.execute_multi_agent_transaction(
            transaction=transaction,
            from_wallet_id=from_wallet,
            to_wallet_id=to_wallet
        )
    else:
        # Fallback: manual approval
        print("Consensus failed, requiring manual approval")
        return request_manual_approval(transaction)
```

### Scheduled Payments with Mandates

```typescript
async function scheduleRecurringPayment(
  ap2: AP2Protocol,
  amount: number,
  schedule: string // e.g., "monthly"
) {
  // Create long-term mandate
  const mandate = ap2.createMandate(
    'intent',
    amount,
    'USD',
    `${schedule} recurring payment`,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    { schedule }
  );

  // Store mandate for future use
  await storeMandateForScheduler(mandate);

  return mandate;
}

// Scheduler executes payments using pre-approved mandate
async function executeScheduledPayment(mandateId: string) {
  const mandate = await getStoredMandate(mandateId);
  
  // Verify mandate is still valid
  if (ap2.verifyMandate(mandate)) {
    // Execute payment using mandate
    const payment = await processPaymentWithMandate(mandate);
    return payment;
  } else {
    throw new Error('Mandate expired or invalid');
  }
}
```

## Error Handling Examples

```python
from bridge_sdk import BridgeAPIError

try:
    transfer = bridge.create_transfer(
        from_wallet_id='wallet_123',
        to_wallet_id='wallet_456',
        amount=1000.00,
        currency='USD'
    )
except BridgeAPIError as e:
    if e.statusCode == 400:
        print(f"Invalid request: {e.message}")
    elif e.statusCode == 401:
        print("Authentication failed")
    elif e.statusCode == 429:
        print("Rate limit exceeded, retrying...")
        time.sleep(60)
        # Retry logic
    else:
        print(f"API error: {e.message}")
```

## Best Practices

1. **Always validate inputs** before making API calls
2. **Implement retry logic** with exponential backoff for transient errors
3. **Store API keys securely** using environment variables
4. **Use idempotency keys** for payment operations
5. **Verify webhook signatures** before processing events
6. **Log all operations** for audit and debugging
7. **Test in sandbox** before production deployment
8. **Monitor rate limits** and implement queuing if needed

## Additional Resources

- [API Documentation](./API.md)
- [Setup Guide](./SETUP.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Bridge API Docs](https://docs.bridge.xyz)
