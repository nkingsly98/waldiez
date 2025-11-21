# Bridge Python SDK

Complete Python SDK for Bridge API integration with AP2/X402 protocol support.

## Installation

```bash
pip install -r requirements.txt
```

## Quick Start

```python
from bridge_sdk import create_bridge_client, BridgeEnvironment
from ap2_integration import AP2Protocol

# Initialize Bridge SDK
bridge = create_bridge_client(
    api_key="your_api_key",
    environment="sandbox"
)

# Create a customer
customer = bridge.create_customer(
    email="user@example.com",
    first_name="John",
    last_name="Doe"
)

# Create a wallet
wallet = bridge.create_wallet(
    customer_id=customer.id,
    currency="USD"
)

# Initialize AP2 Protocol
ap2 = AP2Protocol(
    bridge_sdk=bridge,
    agent_id="agent_001",
    agent_key="your_agent_key"
)

# Create payment mandate
from datetime import datetime, timedelta
mandate = ap2.create_mandate(
    mandate_type=MandateType.INTENT,
    amount=100.0,
    currency="USD",
    description="AI agent service payment",
    expiry=datetime.now() + timedelta(hours=24)
)
```

## Features

- **Customer Management**: Create, get, list, delete customers
- **KYC Processing**: Start and manage KYC verification
- **Wallet Management**: Create and manage crypto wallets
- **Payment Processing**: Transfers, on-ramp, off-ramp
- **Card Management**: Issue, freeze, cancel cards
- **External Accounts**: Link bank accounts
- **AP2 Protocol**: Agent payment mandates and consensus
- **Multi-Agent Security**: Byzantine fault tolerance

## Documentation

See the main [API documentation](../../docs/API.md) for detailed usage.
