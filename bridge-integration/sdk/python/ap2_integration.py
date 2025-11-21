"""
AP2/X402 Protocol Integration
Agent Payment Protocol for autonomous AI agent payments
"""
import json
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field
import httpx


class MandateType(str, Enum):
    INTENT = "intent"
    CART = "cart"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentRole(str, Enum):
    INITIATOR = "initiator"
    VALIDATOR = "validator"
    EXECUTOR = "executor"


class Mandate(BaseModel):
    id: str
    mandate_type: MandateType
    agent_id: str
    amount: float
    currency: str
    description: str
    expiry: datetime
    signature: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class X402PaymentRequest(BaseModel):
    request_id: str
    amount: float
    currency: str
    recipient_agent: str
    payment_method: str
    mandate_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentConsensus(BaseModel):
    agent_id: str
    vote: bool
    signature: str
    timestamp: datetime


class MultiAgentTransaction(BaseModel):
    transaction_id: str
    initiator_agent: str
    validator_agents: List[str]
    required_votes: int
    consensus_votes: List[AgentConsensus] = Field(default_factory=list)
    status: PaymentStatus
    amount: float
    currency: str


class AP2Protocol:
    """AP2/X402 Protocol Implementation for Agent Payments"""
    
    def __init__(
        self,
        bridge_sdk,
        agent_id: str,
        agent_key: str,
        byzantine_threshold: float = 0.67
    ):
        self.bridge_sdk = bridge_sdk
        self.agent_id = agent_id
        self.agent_key = agent_key
        self.byzantine_threshold = byzantine_threshold
        self.client = httpx.Client(timeout=30)
    
    def create_mandate(
        self,
        mandate_type: MandateType,
        amount: float,
        currency: str,
        description: str,
        expiry: datetime,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Mandate:
        """Create a payment mandate for agent authorization"""
        import uuid
        import hashlib
        
        mandate_id = str(uuid.uuid4())
        mandate_data = {
            "id": mandate_id,
            "mandate_type": mandate_type.value,
            "agent_id": self.agent_id,
            "amount": amount,
            "currency": currency,
            "description": description,
            "expiry": expiry.isoformat(),
            "metadata": metadata or {}
        }
        
        # Create signature
        data_str = json.dumps(mandate_data, sort_keys=True)
        signature = hashlib.sha256(
            (data_str + self.agent_key).encode()
        ).hexdigest()
        
        mandate_data["signature"] = signature
        return Mandate(**mandate_data)
    
    def verify_mandate(self, mandate: Mandate) -> bool:
        """Verify mandate signature and validity"""
        import hashlib
        
        # Check expiry
        if mandate.expiry < datetime.now():
            return False
        
        # Verify signature
        mandate_data = mandate.model_dump()
        original_signature = mandate_data.pop("signature")
        data_str = json.dumps(mandate_data, sort_keys=True)
        expected_signature = hashlib.sha256(
            (data_str + self.agent_key).encode()
        ).hexdigest()
        
        return expected_signature == original_signature
    
    def create_x402_payment_request(
        self,
        amount: float,
        currency: str,
        recipient_agent: str,
        payment_method: str,
        mandate_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> X402PaymentRequest:
        """Create X402 payment request"""
        import uuid
        
        return X402PaymentRequest(
            request_id=str(uuid.uuid4()),
            amount=amount,
            currency=currency,
            recipient_agent=recipient_agent,
            payment_method=payment_method,
            mandate_id=mandate_id,
            metadata=metadata or {}
        )
    
    def process_agent_payment(
        self,
        payment_request: X402PaymentRequest,
        from_wallet_id: str,
        to_wallet_id: str
    ) -> Dict[str, Any]:
        """Process agent-to-agent payment"""
        # Create transfer using Bridge SDK
        transfer = self.bridge_sdk.create_transfer(
            from_wallet_id=from_wallet_id,
            to_wallet_id=to_wallet_id,
            amount=payment_request.amount,
            currency=payment_request.currency
        )
        
        return {
            "payment_request_id": payment_request.request_id,
            "transfer_id": transfer.id,
            "status": transfer.status.value,
            "agent_id": self.agent_id
        }
    
    def initiate_multi_agent_transaction(
        self,
        validator_agents: List[str],
        amount: float,
        currency: str,
        required_votes: Optional[int] = None
    ) -> MultiAgentTransaction:
        """Initiate a multi-agent consensus transaction"""
        import uuid
        
        if required_votes is None:
            required_votes = int(len(validator_agents) * self.byzantine_threshold)
        
        return MultiAgentTransaction(
            transaction_id=str(uuid.uuid4()),
            initiator_agent=self.agent_id,
            validator_agents=validator_agents,
            required_votes=required_votes,
            status=PaymentStatus.PENDING,
            amount=amount,
            currency=currency
        )
    
    def add_consensus_vote(
        self,
        transaction: MultiAgentTransaction,
        agent_id: str,
        vote: bool,
        agent_signature: str
    ) -> MultiAgentTransaction:
        """Add a consensus vote from a validator agent"""
        if agent_id not in transaction.validator_agents:
            raise ValueError(f"Agent {agent_id} is not a validator for this transaction")
        
        # Check if agent already voted
        existing_votes = [v for v in transaction.consensus_votes if v.agent_id == agent_id]
        if existing_votes:
            raise ValueError(f"Agent {agent_id} has already voted")
        
        consensus = AgentConsensus(
            agent_id=agent_id,
            vote=vote,
            signature=agent_signature,
            timestamp=datetime.now()
        )
        
        transaction.consensus_votes.append(consensus)
        
        # Check if consensus is reached
        positive_votes = sum(1 for v in transaction.consensus_votes if v.vote)
        if positive_votes >= transaction.required_votes:
            transaction.status = PaymentStatus.AUTHORIZED
        elif len(transaction.consensus_votes) == len(transaction.validator_agents):
            # All agents voted but consensus not reached
            transaction.status = PaymentStatus.FAILED
        
        return transaction
    
    def execute_multi_agent_transaction(
        self,
        transaction: MultiAgentTransaction,
        from_wallet_id: str,
        to_wallet_id: str
    ) -> Dict[str, Any]:
        """Execute a multi-agent transaction after consensus"""
        if transaction.status != PaymentStatus.AUTHORIZED:
            raise ValueError("Transaction not authorized for execution")
        
        # Execute the transfer
        transfer = self.bridge_sdk.create_transfer(
            from_wallet_id=from_wallet_id,
            to_wallet_id=to_wallet_id,
            amount=transaction.amount,
            currency=transaction.currency
        )
        
        transaction.status = PaymentStatus.COMPLETED
        
        return {
            "transaction_id": transaction.transaction_id,
            "transfer_id": transfer.id,
            "status": transfer.status.value,
            "consensus_votes": len(transaction.consensus_votes),
            "required_votes": transaction.required_votes
        }
    
    def validate_byzantine_tolerance(
        self,
        total_agents: int,
        faulty_agents: int
    ) -> bool:
        """Validate Byzantine fault tolerance threshold"""
        max_faulty = (total_agents - 1) // 3
        return faulty_agents <= max_faulty
    
    def create_agent_signature(self, data: Dict[str, Any]) -> str:
        """Create digital signature for agent actions"""
        import hashlib
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(
            (data_str + self.agent_key).encode()
        ).hexdigest()
    
    def verify_agent_signature(
        self,
        data: Dict[str, Any],
        signature: str,
        agent_key: str
    ) -> bool:
        """Verify agent signature"""
        import hashlib
        data_str = json.dumps(data, sort_keys=True)
        expected = hashlib.sha256(
            (data_str + agent_key).encode()
        ).hexdigest()
        return expected == signature
    
    def close(self):
        """Close HTTP client"""
        self.client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class AP2SecurityManager:
    """Security manager for AP2 protocol with multi-agent validation"""
    
    def __init__(self, required_agents: int = 3):
        self.required_agents = required_agents
        self.agent_registry: Dict[str, Dict[str, Any]] = {}
    
    def register_agent(
        self,
        agent_id: str,
        public_key: str,
        role: AgentRole,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Register an agent in the security framework"""
        self.agent_registry[agent_id] = {
            "public_key": public_key,
            "role": role.value,
            "registered_at": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent information"""
        return self.agent_registry.get(agent_id)
    
    def validate_transaction_security(
        self,
        transaction: MultiAgentTransaction
    ) -> Dict[str, Any]:
        """Validate transaction meets security requirements"""
        validation = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        # Check minimum number of validators
        if len(transaction.validator_agents) < self.required_agents:
            validation["valid"] = False
            validation["errors"].append(
                f"Minimum {self.required_agents} validators required"
            )
        
        # Check Byzantine tolerance
        total_agents = len(transaction.validator_agents) + 1  # +1 for initiator
        max_faulty = (total_agents - 1) // 3
        if transaction.required_votes < (total_agents - max_faulty):
            validation["warnings"].append(
                f"Byzantine tolerance may not be sufficient"
            )
        
        return validation
