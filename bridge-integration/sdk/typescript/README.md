# Bridge TypeScript SDK

Complete TypeScript SDK for Bridge API integration with AP2/X402 protocol support.

## Installation

```bash
npm install @bridge/sdk
# or
yarn add @bridge/sdk
```

## Quick Start

```typescript
import { createBridgeClient, AP2Protocol } from '@bridge/sdk';

// Initialize Bridge SDK
const bridge = createBridgeClient(
  process.env.BRIDGE_API_KEY,
  'sandbox'
);

// Create a customer
const customer = await bridge.createCustomer(
  'user@example.com',
  'John',
  'Doe'
);

// Create a wallet
const wallet = await bridge.createWallet(
  customer.id,
  'USD'
);

// Initialize AP2 Protocol
const ap2 = new AP2Protocol(bridge, {
  agentId: 'agent_001',
  agentKey: process.env.AGENT_KEY!
});

// Create payment mandate
const mandate = ap2.createMandate(
  'intent',
  100.0,
  'USD',
  'AI agent service payment',
  new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
);
```

## Features

- **Full Type Safety**: Complete TypeScript type definitions
- **Customer Management**: Create, get, list, delete customers
- **KYC Processing**: Start and manage KYC verification
- **Wallet Management**: Create and manage crypto wallets
- **Payment Processing**: Transfers, on-ramp, off-ramp
- **Card Management**: Issue, freeze, cancel cards
- **External Accounts**: Link bank accounts
- **AP2 Protocol**: Agent payment mandates and consensus
- **Multi-Agent Security**: Byzantine fault tolerance

## React Hooks

```typescript
import { useBridge } from '@bridge/sdk/react';

function MyComponent() {
  const { customer, loading, error } = useBridge('customer_123');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Welcome {customer.first_name}!</div>;
}
```

## Documentation

See the main [API documentation](../../docs/API.md) for detailed usage.
