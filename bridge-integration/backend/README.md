# Backend Services

Complete backend implementation for Bridge API integration.

## Structure

```
backend/
├── services/           # Business logic layer
│   ├── bridge-service.ts
│   ├── ap2-service.ts
│   ├── payment-service.ts
│   └── agent-service.ts
├── api/                # API routes
│   ├── routes/
│   │   ├── customers.ts
│   │   ├── payments.ts
│   │   ├── agents.ts
│   │   └── merchants.ts
│   └── index.ts
└── middleware/         # Express middleware
    ├── auth.ts
    ├── validation.ts
    └── error-handler.ts
```

## Services

### BridgeService
- Customer management
- Wallet operations
- Transfers and payments
- Card management
- External account linking
- Webhook processing

### AP2Service
- Agent registration and management
- Payment mandate creation
- Multi-agent consensus transactions
- Byzantine fault tolerance
- Agent action logging

### PaymentService
- Payment processing
- Fee estimation
- Transaction history

### AgentService
- Agent CRUD operations
- Configuration management
- Wallet linking
- Spending limits

## API Endpoints

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer
- `POST /api/customers/:id/kyc` - Start KYC
- `POST /api/customers/:id/wallets` - Create wallet
- `GET /api/customers/:id/wallets` - List wallets

### Payments
- `POST /api/payments/transfers` - Create transfer
- `GET /api/payments/transfers/:id` - Get transfer
- `POST /api/payments/on-ramp` - On-ramp fiat to crypto
- `POST /api/payments/off-ramp` - Off-ramp crypto to fiat
- `POST /api/payments/estimate-fees` - Estimate fees

### Agents
- `POST /api/agents` - Register agent
- `GET /api/agents/:id` - Get agent
- `POST /api/agents/:id/mandates` - Create mandate
- `POST /api/agents/consensus/initiate` - Start consensus
- `POST /api/agents/consensus/:id/vote` - Add vote
- `POST /api/agents/consensus/:id/execute` - Execute transaction

### Merchants
- `POST /api/merchants/register` - Register merchant
- `GET /api/merchants/:id/dashboard` - Get dashboard

## Setup

```bash
npm install
```

## Environment Variables

```bash
BRIDGE_API_KEY=your_api_key
BRIDGE_ENVIRONMENT=sandbox
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Running

```bash
npm start
```

## Development

```bash
npm run dev
```
