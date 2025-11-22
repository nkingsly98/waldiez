import uuid
from your_momo_sdk import MoMo  # Assuming you have a MoMo SDK that we can import

class IdempotencyWrapper:
    def __init__(self):
        self.idempotency_key = str(uuid.uuid4())

    def check_duplicate(self, key):
        # Logic to check if this key has been used before.
        pass

class CollectionIdempotent(IdempotencyWrapper):
    def create_payment(self, amount, currency, receiver_info):
        if self.check_duplicate(self.idempotency_key):
            raise Exception("Duplicate transaction detected")
        # Logic to interact with MoMo SDK for collection
        response = MoMo.create_collection(amount, currency, receiver_info, self.idempotency_key)
        return response

class DisbursementIdempotent(IdempotencyWrapper):
    def create_payment(self, amount, currency, payer_info):
        if self.check_duplicate(self.idempotency_key):
            raise Exception("Duplicate transaction detected")
        # Logic to interact with MoMo SDK for disbursement
        response = MoMo.create_disbursement(amount, currency, payer_info, self.idempotency_key)
        return response

class RemittanceIdempotent(IdempotencyWrapper):
    def create_payment(self, amount, currency, sender_info, receiver_info):
        if self.check_duplicate(self.idempotency_key):
            raise Exception("Duplicate transaction detected")
        # Logic to interact with MoMo SDK for remittance
        response = MoMo.create_remittance(amount, currency, sender_info, receiver_info, self.idempotency_key)
        return response
