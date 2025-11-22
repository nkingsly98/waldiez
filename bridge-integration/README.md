# Bridge API Integration

Complete full-stack integration for Bridge payment platform with autonomous AI agent payments using AP2/X402 protocol.

## 🚀 Features

- **Complete Bridge SDK** - Python and TypeScript implementations
- **AP2/X402 Protocol** - Agent payment protocol with multi-agent consensus
- **Database Schema** - Production-ready PostgreSQL schema
- **Backend API** - RESTful API with Express.js
- **Frontend UI** - React/Next.js dashboard and components
- **Multi-Agent Security** - Byzantine fault tolerance
- **Real-time Webhooks** - Event-driven architecture
- **Docker Support** - One-command deployment

## 📁 Repository Structure

```
bridge-integration/
├── sdk/
│   ├── python/              # Python SDK
│   │   ├── bridge_sdk.py
│   │   ├── ap2_integration.py
│   │   └── requirements.txt
│   └── typescript/          # TypeScript SDK
│       ├── src/
│       └── package.json
├── database/
│   ├── schema.sql          # Complete schema
│   └── migrations/         # Migration files
├── backend/
│   ├── services/           # Business logic
│   ├── api/               # API routes
│   └── middleware/        # Auth, validation
├── frontend/
│   ├── pages/             # Next.js pages
│   ├── components/        # React components
│   └── lib/               # Utilities
├── docs/
│   ├── API.md            # API documentation
│   ├── SETUP.md          # Setup guide
│   ├── ARCHITECTURE.md   # Architecture overview
│   └── EXAMPLES.md       # Usage examples
├── scripts/              # Helper scripts
├── .env.example
├── docker-compose.yml
└── package.json
```

## 🎯 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Bridge API key ([Get one here](https://bridge.xyz))

### Installation (15 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd bridge-integration

# 2. Install dependencies
npm run setup

# 3. Setup database
createdb bridge_db
psql bridge_db < database/schema.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 5. Start services
npm run dev
```

Visit:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/docs

### Docker Setup (5 minutes)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation

- **[API Reference](docs/API.md)** - Complete API documentation
- **[Setup Guide](docs/SETUP.md)** - Detailed installation instructions
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[Examples](docs/EXAMPLES.md)** - Code examples and tutorials

## 🔧 Usage Examples

### Python SDK

```python
from bridge_sdk import create_bridge_client
from ap2_integration import AP2Protocol

# Initialize Bridge client
bridge = create_bridge_client(api_key="your_key")

# Create customer
customer = bridge.create_customer(
    email="user@example.com",
    first_name="John",
    last_name="Doe"
)

# Create wallet
wallet = bridge.create_wallet(
    customer_id=customer.id,
    currency="USD"
)

# Initialize AP2 protocol
ap2 = AP2Protocol(
    bridge_sdk=bridge,
    agent_id="agent_001",
    agent_key="your_agent_key"
)

# Create payment mandate
mandate = ap2.create_mandate(
    mandate_type="intent",
    amount=100.0,
    currency="USD",
    description="AI service payment",
    expiry=datetime.now() + timedelta(hours=24)
)
```

### TypeScript SDK

```typescript
import { createBridgeClient, AP2Protocol } from '@bridge/sdk';

// Initialize Bridge client
const bridge = createBridgeClient(process.env.BRIDGE_API_KEY);

// Create customer
const customer = await bridge.createCustomer(
  'user@example.com',
  'John',
  'Doe'
);

// Create wallet
const wallet = await bridge.createWallet(
  customer.id,
  'USD'
);

// Initialize AP2 protocol
const ap2 = new AP2Protocol(bridge, {
  agentId: 'agent_001',
  agentKey: process.env.AGENT_KEY
});

// Multi-agent consensus transaction
const transaction = ap2.initiateMultiAgentTransaction(
  ['agent_002', 'agent_003'],
  500.0,
  'USD'
);
```

### REST API

```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Create transfer
curl -X POST http://localhost:3000/api/payments/transfers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_abc123",
    "fromWalletId": "wallet_123",
    "toWalletId": "wallet_456",
    "amount": 100.00,
    "currency": "USD"
  }'
```

## 🏗️ Architecture

### Components

1. **SDK Layer** - Python and TypeScript SDKs
2. **API Layer** - RESTful backend services
3. **Database Layer** - PostgreSQL with migrations
4. **Frontend Layer** - React/Next.js UI
5. **Protocol Layer** - AP2/X402 implementation

### Security Features

- **Multi-agent consensus** - Byzantine fault tolerance
- **Payment mandates** - Pre-authorized payments
- **Spending limits** - Agent-level controls
- **JWT authentication** - Secure API access
- **Webhook signatures** - Verified events

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# Integration tests
npm run test:integration
```

## 📦 Deployment

### Production Checklist

- [ ] Set `BRIDGE_ENVIRONMENT=production`
- [ ] Use production database
- [ ] Configure secure `JWT_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring (Sentry, etc.)
- [ ] Configure backups
- [ ] Setup CI/CD pipeline
- [ ] Review security settings

See [SETUP.md](docs/SETUP.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Email: support@example.com

## ✨ Acknowledgments

- Bridge API for payment infrastructure
- AG2 community for agent collaboration patterns
- Open source contributors

---

Built with ❤️ for autonomous AI agent payments
