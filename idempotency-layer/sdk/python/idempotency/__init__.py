"""
Idempotency Layer for Bridge API and MTN MoMo SDK
Prevents duplicate transactions and enables safe retries
"""

from .manager import IdempotencyManager, IdempotencyConflictError

__version__ = "1.0.0"
__all__ = ['IdempotencyManager', 'IdempotencyConflictError']