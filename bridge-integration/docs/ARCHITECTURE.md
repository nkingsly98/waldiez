# System Architecture

Complete architecture overview of the Bridge API integration.

## Overview

The Bridge integration is a full-stack platform for autonomous AI agent payments, built with a layered architecture for scalability, security, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   React UI  │  │  Next.js     │  │  Tailwind CSS    │  │
│  │  Components │  │  Pages       │  │  Styling         │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┴─────────────────────────────────┐
│                        API Gateway                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Auth      │  │  Validation  │  │  Rate Limiting   │  │
│  │  Middleware  │  │  Middleware  │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      Backend Services                        │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Bridge Service  │  │  AP2 Service │  │Payment Service│  │
│  │ • Customers     │  │  • Agents    │  │ • Transfers   │  │
│  │ • Wallets       │  │  • Mandates  │  │ • On/Off-ramp │  │
│  │ • Cards         │  │  • Consensus │  │ • Fee calc    │  │
│  └─────────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼─────────┐
│   PostgreSQL   │  │ Bridge API  │  │  External APIs   │
│   • Users      │  │ (Bridge.xyz)│  │  • KYC providers │
│   • Wallets    │  │             │  │  • Banks         │
│   • Agents     │  │             │  │                  │
│   • Txns       │  │             │  │                  │
└────────────────┘  └─────────────┘  └──────────────────┘
```

## Components

### 1. Frontend Layer

**Technology**: React, Next.js, TypeScript, Tailwind CSS

**Responsibilities**:
- User interface and experience
- Form handling and validation
- State management
- API communication

**Key Pages**:
- Onboarding - KYC verification flow
- Dashboard - Unified interface
- Merchant pages - Business management
- Agent configuration

**Components**:
- WalletsTab - Wallet management
- TransfersTab - Payment operations
- CardsTab - Card management
- AgentsTab - AI agent configuration

### 2. API Gateway

**Technology**: Express.js middleware

**Responsibilities**:
- Request routing
- Authentication (JWT)
- Input validation
- Rate limiting
- Error handling
- CORS management

**Middleware**:
- `auth.ts` - JWT token verification
- `validation.ts` - Request validation
- `error-handler.ts` - Global error handling

### 3. Backend Services

#### BridgeService
Handles Bridge API integration:
- Customer lifecycle management
- Wallet operations (create, list, sync)
- Transfer processing
- Card issuance and management
- External account linking
- Webhook event processing

#### AP2Service
Implements AP2/X402 protocol:
- Agent registration and management
- Payment mandate creation and verification
- Multi-agent consensus transactions
- Byzantine fault tolerance
- Agent action logging
- Spending limit enforcement

#### PaymentService
Payment processing logic:
- Transfer execution
- Balance verification
- Fee calculation
- Transaction history
- Payment status tracking

#### AgentService
AI agent management:
- CRUD operations
- Configuration management
- Wallet linking
- Spending limits

### 4. SDK Layer

#### Python SDK
- Complete Bridge API wrapper
- AP2 protocol implementation
- Pydantic models for type safety
- Async/await support
- Error handling and retries

#### TypeScript SDK
- Full type definitions
- Axios-based HTTP client
- Promise-based API
- React hooks (optional)
- Comprehensive error handling

### 5. Database Layer

**Technology**: PostgreSQL 14+

**Schema**:
- Users and authentication
- Bridge customer records
- Crypto wallets
- External accounts
- Transactions
- AI agents
- Consensus transactions
- Payment mandates
- Webhook events
- Audit logs

**Features**:
- UUID primary keys
- Automatic timestamps
- Foreign key constraints
- Indexes for performance
- Triggers for business logic
- Views for common queries

### 6. Integration Layer

#### Bridge API
External payment platform:
- Customer management
- Wallet creation
- Payment processing
- KYC verification
- Card issuance

#### AP2/X402 Protocol
Agent payment protocol:
- Payment mandates
- Multi-agent consensus
- Byzantine fault tolerance
- Digital signatures
- Transaction validation

## Security Architecture

### Authentication & Authorization
```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │   API    │         │ Backend  │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ 1. Login          │                    │
     ├──────────────────>│                    │
     │                    │ 2. Verify         │
     │                    ├──────────────────>│
     │                    │ 3. Generate JWT   │
     │                    │<──────────────────┤
     │ 4. Return Token   │                    │
     │<──────────────────┤                    │
     │                    │                    │
     │ 5. API Request    │                    │
     │    + JWT Token    │                    │
     ├──────────────────>│                    │
     │                    │ 6. Verify JWT     │
     │                    ├──────────────────>│
     │                    │ 7. Process        │
     │                    │<──────────────────┤
     │ 8. Response       │                    │
     │<──────────────────┤                    │
```

### Multi-Agent Security

Byzantine Fault Tolerance:
- Minimum 3 validator agents
- 67% consensus threshold
- Digital signature verification
- Spending limit enforcement
- Action audit logging

## Data Flow

### Customer Onboarding Flow
```
User → Frontend → API → BridgeService → Bridge API
                   ↓
              PostgreSQL (store customer record)
```

### Payment Transfer Flow
```
User → Frontend → API → PaymentService → BridgeService
                                            ↓
                                       Bridge API
                   ↓
              PostgreSQL (log transaction)
                   ↓
              Webhook (async notification)
```

### Multi-Agent Consensus Flow
```
Initiator Agent → AP2Service → Create Consensus Transaction
                                        ↓
                                  PostgreSQL
                                        ↓
Validator Agents → AP2Service → Add Votes
                                        ↓
                                Check Consensus
                                        ↓
                              Execute Transfer
                                        ↓
                              BridgeService → Bridge API
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer in front of API
- Database connection pooling
- Redis for session storage

### Caching Strategy
- Wallet balance caching
- Customer data caching
- Rate limit counters
- Session storage

### Database Optimization
- Indexes on foreign keys
- Indexes on frequently queried fields
- Partitioning for large tables
- Read replicas for scaling reads

## Deployment Architecture

### Development
```
Local Machine
├── PostgreSQL (Docker)
├── Redis (Docker)
├── Backend (npm run dev)
└── Frontend (npm run dev)
```

### Production
```
Cloud Infrastructure
├── Load Balancer
├── Application Servers (Multiple instances)
│   ├── Backend API
│   └── Frontend SSR
├── Database Cluster
│   ├── Primary (Write)
│   └── Replicas (Read)
├── Cache Layer (Redis Cluster)
└── CDN (Static assets)
```

## Monitoring & Observability

### Logging
- Structured logging (JSON)
- Log levels (error, warn, info, debug)
- Centralized log aggregation
- Request/response logging

### Metrics
- API response times
- Database query performance
- Payment success rates
- Agent action counts
- Error rates

### Alerts
- API downtime
- Database connection failures
- Payment failures
- Security events
- Rate limit violations

## Technology Stack

### Backend
- Node.js 18+
- TypeScript
- Express.js
- PostgreSQL
- Redis (optional)

### Frontend
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS

### SDKs
- Python 3.9+
- TypeScript
- httpx / axios

### DevOps
- Docker
- Docker Compose
- GitHub Actions
- PM2 (production)

## Best Practices

1. **Security First**
   - Never expose API keys
   - Use HTTPS in production
   - Validate all inputs
   - Implement rate limiting

2. **Error Handling**
   - Graceful degradation
   - User-friendly error messages
   - Comprehensive logging
   - Retry logic with backoff

3. **Testing**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for critical flows
   - Load testing for scalability

4. **Documentation**
   - API documentation
   - Code comments
   - Architecture diagrams
   - Runbooks for operations

## Future Enhancements

- GraphQL API support
- Real-time notifications via WebSockets
- Mobile app support
- Advanced analytics dashboard
- Multi-currency support
- Automated compliance reporting
