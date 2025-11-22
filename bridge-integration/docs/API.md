# Bridge API Documentation

Complete API reference for the Bridge payment platform integration.

## Base URL

- **Sandbox**: `https://api.sandbox.bridge.xyz/v1`
- **Production**: `https://api.bridge.xyz/v1`

## Authentication

All API requests require authentication using Bearer tokens:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Customers

#### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "userId": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cust_abc123",
    "email": "user@example.com",
    "kyc_status": "not_started",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Start KYC
```http
POST /api/customers/:customerId/kyc
```

#### Create Wallet
```http
POST /api/customers/:customerId/wallets
Content-Type: application/json

{
  "currency": "USD",
  "walletType": "crypto"
}
```

### Payments

#### Create Transfer
```http
POST /api/payments/transfers
Content-Type: application/json

{
  "customerId": "cust_abc123",
  "fromWalletId": "wallet_123",
  "toWalletId": "wallet_456",
  "amount": 100.00,
  "currency": "USD"
}
```

#### On-Ramp (Fiat to Crypto)
```http
POST /api/payments/on-ramp
Content-Type: application/json

{
  "customerId": "cust_abc123",
  "walletId": "wallet_123",
  "amount": 1000.00,
  "currency": "USD",
  "paymentMethod": "bank_account"
}
```

#### Off-Ramp (Crypto to Fiat)
```http
POST /api/payments/off-ramp
Content-Type: application/json

{
  "customerId": "cust_abc123",
  "walletId": "wallet_123",
  "amount": 500.00,
  "currency": "USD",
  "destinationAccount": "account_789"
}
```

### Agents

#### Register Agent
```http
POST /api/agents
Content-Type: application/json

{
  "userId": "user_123",
  "agentName": "My Payment Agent",
  "agentType": "payment",
  "publicKey": "pk_...",
  "role": "initiator",
  "spendingLimit": 1000.00
}
```

#### Initiate Consensus Transaction
```http
POST /api/agents/consensus/initiate
Content-Type: application/json

{
  "initiatorAgentId": "agent_123",
  "validatorAgentIds": ["agent_456", "agent_789"],
  "amount": 500.00,
  "currency": "USD"
}
```

#### Add Consensus Vote
```http
POST /api/agents/consensus/:transactionId/vote
Content-Type: application/json

{
  "validatorAgentId": "agent_456",
  "vote": true,
  "signature": "sig_..."
}
```

#### Execute Consensus Transaction
```http
POST /api/agents/consensus/:transactionId/execute
Content-Type: application/json

{
  "fromWalletId": "wallet_123",
  "toWalletId": "wallet_456"
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `INVALID_REQUEST` - Invalid request parameters
- `UNAUTHORIZED` - Invalid or missing authentication
- `INSUFFICIENT_BALANCE` - Not enough funds
- `KYC_REQUIRED` - KYC verification needed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

- **Default**: 100 requests per minute
- **Burst**: 200 requests per minute

Headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## Webhooks

Register webhook endpoints to receive real-time updates:

```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhooks/bridge",
  "events": [
    "customer.kyc.completed",
    "transfer.completed",
    "transfer.failed"
  ]
}
```

### Webhook Events

- `customer.kyc.completed` - KYC verification approved
- `customer.kyc.rejected` - KYC verification rejected
- `transfer.completed` - Transfer completed successfully
- `transfer.failed` - Transfer failed
- `card.issued` - Card issued successfully
- `agent.action.completed` - Agent action completed

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "transfer.completed",
  "data": {
    "transfer_id": "txn_456",
    "amount": 100.00,
    "status": "completed"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

## SDKs

### Python

```python
from bridge_sdk import create_bridge_client

bridge = create_bridge_client(api_key="your_key")
customer = bridge.create_customer(email="user@example.com")
```

### TypeScript

```typescript
import { createBridgeClient } from '@bridge/sdk';

const bridge = createBridgeClient('your_key');
const customer = await bridge.createCustomer('user@example.com');
```

## Best Practices

1. **Always use HTTPS** for production
2. **Store API keys securely** - never commit to source control
3. **Implement retry logic** with exponential backoff
4. **Validate webhook signatures** before processing
5. **Handle errors gracefully** with user-friendly messages
6. **Use idempotency keys** for payment operations
7. **Monitor rate limits** to avoid throttling
8. **Test in sandbox** before production deployment

## Support

For API support, contact:
- Email: support@bridge.xyz
- Documentation: https://docs.bridge.xyz
- Status: https://status.bridge.xyz
