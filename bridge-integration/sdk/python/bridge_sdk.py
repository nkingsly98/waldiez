"""
Bridge API SDK for Python
Complete integration with Bridge payment platform
"""
import os
from typing import Dict, List, Optional, Any
from enum import Enum
import httpx
from pydantic import BaseModel, Field


class BridgeEnvironment(str, Enum):
    SANDBOX = "sandbox"
    PRODUCTION = "production"


class KYCStatus(str, Enum):
    NOT_STARTED = "not_started"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class WalletType(str, Enum):
    CRYPTO = "crypto"
    LIQUIDITY = "liquidity"


class TransferStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Customer(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    kyc_status: KYCStatus = KYCStatus.NOT_STARTED
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Wallet(BaseModel):
    id: str
    customer_id: str
    wallet_type: WalletType
    currency: str
    address: str
    balance: float = 0.0
    created_at: str


class Transfer(BaseModel):
    id: str
    from_wallet_id: str
    to_wallet_id: str
    amount: float
    currency: str
    status: TransferStatus
    created_at: str
    completed_at: Optional[str] = None


class Card(BaseModel):
    id: str
    customer_id: str
    last_four: str
    brand: str
    status: str
    created_at: str


class BridgeAPIError(Exception):
    """Base exception for Bridge API errors"""
    pass


class BridgeSDK:
    """Complete Bridge API SDK with comprehensive functionality"""
    
    def __init__(
        self,
        api_key: str,
        environment: BridgeEnvironment = BridgeEnvironment.SANDBOX,
        timeout: int = 30
    ):
        self.api_key = api_key
        self.environment = environment
        self.timeout = timeout
        self.base_url = self._get_base_url()
        self.client = httpx.Client(
            headers=self._get_headers(),
            timeout=timeout
        )
    
    def _get_base_url(self) -> str:
        """Get API base URL based on environment"""
        if self.environment == BridgeEnvironment.SANDBOX:
            return "https://api.sandbox.bridge.xyz/v1"
        return "https://api.bridge.xyz/v1"
    
    def _get_headers(self) -> Dict[str, str]:
        """Get default headers for API requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "BridgeSDK-Python/1.0"
        }
    
    def _handle_response(self, response: httpx.Response) -> Dict[str, Any]:
        """Handle API response and errors"""
        try:
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            error_msg = f"Bridge API error: {e.response.status_code}"
            try:
                error_data = e.response.json()
                error_msg += f" - {error_data.get('message', '')}"
            except Exception:
                pass
            raise BridgeAPIError(error_msg) from e
    
    # Customer Management
    def create_customer(
        self,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Customer:
        """Create a new customer"""
        payload = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "metadata": metadata or {}
        }
        response = self.client.post(f"{self.base_url}/customers", json=payload)
        data = self._handle_response(response)
        return Customer(**data)
    
    def get_customer(self, customer_id: str) -> Customer:
        """Get customer details"""
        response = self.client.get(f"{self.base_url}/customers/{customer_id}")
        data = self._handle_response(response)
        return Customer(**data)
    
    def list_customers(self, limit: int = 100, offset: int = 0) -> List[Customer]:
        """List all customers"""
        params = {"limit": limit, "offset": offset}
        response = self.client.get(f"{self.base_url}/customers", params=params)
        data = self._handle_response(response)
        return [Customer(**customer) for customer in data.get("customers", [])]
    
    def delete_customer(self, customer_id: str) -> bool:
        """Delete a customer"""
        response = self.client.delete(f"{self.base_url}/customers/{customer_id}")
        self._handle_response(response)
        return True
    
    def start_kyc(self, customer_id: str) -> Dict[str, Any]:
        """Start KYC verification process"""
        response = self.client.post(f"{self.base_url}/customers/{customer_id}/kyc")
        return self._handle_response(response)
    
    # Wallet Management
    def create_wallet(
        self,
        customer_id: str,
        currency: str,
        wallet_type: WalletType = WalletType.CRYPTO
    ) -> Wallet:
        """Create a new wallet"""
        payload = {
            "customer_id": customer_id,
            "currency": currency,
            "wallet_type": wallet_type.value
        }
        response = self.client.post(f"{self.base_url}/wallets", json=payload)
        data = self._handle_response(response)
        return Wallet(**data)
    
    def get_wallet(self, wallet_id: str) -> Wallet:
        """Get wallet details"""
        response = self.client.get(f"{self.base_url}/wallets/{wallet_id}")
        data = self._handle_response(response)
        return Wallet(**data)
    
    def list_wallets(self, customer_id: str) -> List[Wallet]:
        """List all wallets for a customer"""
        params = {"customer_id": customer_id}
        response = self.client.get(f"{self.base_url}/wallets", params=params)
        data = self._handle_response(response)
        return [Wallet(**wallet) for wallet in data.get("wallets", [])]
    
    def get_wallet_balance(self, wallet_id: str) -> float:
        """Get wallet balance"""
        wallet = self.get_wallet(wallet_id)
        return wallet.balance
    
    # Payment Processing
    def create_transfer(
        self,
        from_wallet_id: str,
        to_wallet_id: str,
        amount: float,
        currency: str
    ) -> Transfer:
        """Create a transfer between wallets"""
        payload = {
            "from_wallet_id": from_wallet_id,
            "to_wallet_id": to_wallet_id,
            "amount": amount,
            "currency": currency
        }
        response = self.client.post(f"{self.base_url}/transfers", json=payload)
        data = self._handle_response(response)
        return Transfer(**data)
    
    def get_transfer(self, transfer_id: str) -> Transfer:
        """Get transfer details"""
        response = self.client.get(f"{self.base_url}/transfers/{transfer_id}")
        data = self._handle_response(response)
        return Transfer(**data)
    
    def on_ramp(
        self,
        customer_id: str,
        wallet_id: str,
        amount: float,
        currency: str,
        payment_method: str
    ) -> Dict[str, Any]:
        """On-ramp fiat to crypto"""
        payload = {
            "customer_id": customer_id,
            "wallet_id": wallet_id,
            "amount": amount,
            "currency": currency,
            "payment_method": payment_method
        }
        response = self.client.post(f"{self.base_url}/on-ramp", json=payload)
        return self._handle_response(response)
    
    def off_ramp(
        self,
        customer_id: str,
        wallet_id: str,
        amount: float,
        currency: str,
        destination_account: str
    ) -> Dict[str, Any]:
        """Off-ramp crypto to fiat"""
        payload = {
            "customer_id": customer_id,
            "wallet_id": wallet_id,
            "amount": amount,
            "currency": currency,
            "destination_account": destination_account
        }
        response = self.client.post(f"{self.base_url}/off-ramp", json=payload)
        return self._handle_response(response)
    
    # Card Management
    def issue_card(
        self,
        customer_id: str,
        card_type: str = "virtual",
        spending_limit: Optional[float] = None
    ) -> Card:
        """Issue a new card"""
        payload = {
            "customer_id": customer_id,
            "card_type": card_type,
            "spending_limit": spending_limit
        }
        response = self.client.post(f"{self.base_url}/cards", json=payload)
        data = self._handle_response(response)
        return Card(**data)
    
    def get_card(self, card_id: str) -> Card:
        """Get card details"""
        response = self.client.get(f"{self.base_url}/cards/{card_id}")
        data = self._handle_response(response)
        return Card(**data)
    
    def freeze_card(self, card_id: str) -> bool:
        """Freeze a card"""
        response = self.client.post(f"{self.base_url}/cards/{card_id}/freeze")
        self._handle_response(response)
        return True
    
    def cancel_card(self, card_id: str) -> bool:
        """Cancel a card"""
        response = self.client.delete(f"{self.base_url}/cards/{card_id}")
        self._handle_response(response)
        return True
    
    # External Accounts
    def add_external_account(
        self,
        customer_id: str,
        account_number: str,
        routing_number: str,
        account_type: str = "checking"
    ) -> Dict[str, Any]:
        """Add external bank account"""
        payload = {
            "customer_id": customer_id,
            "account_number": account_number,
            "routing_number": routing_number,
            "account_type": account_type
        }
        response = self.client.post(f"{self.base_url}/external-accounts", json=payload)
        return self._handle_response(response)
    
    def list_external_accounts(self, customer_id: str) -> List[Dict[str, Any]]:
        """List external accounts"""
        params = {"customer_id": customer_id}
        response = self.client.get(f"{self.base_url}/external-accounts", params=params)
        data = self._handle_response(response)
        return data.get("accounts", [])
    
    # Webhook Management
    def register_webhook(self, url: str, events: List[str]) -> Dict[str, Any]:
        """Register a webhook endpoint"""
        payload = {"url": url, "events": events}
        response = self.client.post(f"{self.base_url}/webhooks", json=payload)
        return self._handle_response(response)
    
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        secret: str
    ) -> bool:
        """Verify webhook signature"""
        import hmac
        import hashlib
        expected = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    
    def close(self):
        """Close the HTTP client"""
        self.client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Convenience function
def create_bridge_client(
    api_key: Optional[str] = None,
    environment: str = "sandbox"
) -> BridgeSDK:
    """Create a Bridge SDK client instance"""
    api_key = api_key or os.getenv("BRIDGE_API_KEY")
    if not api_key:
        raise ValueError("Bridge API key is required")
    
    env = BridgeEnvironment.SANDBOX if environment == "sandbox" else BridgeEnvironment.PRODUCTION
    return BridgeSDK(api_key=api_key, environment=env)
