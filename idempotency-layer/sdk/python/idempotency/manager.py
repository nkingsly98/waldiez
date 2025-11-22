import psycopg2
import hashlib
import time
from datetime import datetime, timedelta

class IdempotencyManager:
    def __init__(self, db_config):
        self.connection = psycopg2.connect(**db_config)
        self.cursor = self.connection.cursor()
        self.key_expiry_time = timedelta(hours=24)

    def generate_key(self, request_data):
        return hashlib.sha256(request_data.encode()).hexdigest()

    def compute_request_hash(self, request):
        return hashlib.sha256((request.method + request.path + str(request.body)).encode()).hexdigest()

    def check_existing(self, key):
        query = "SELECT response FROM idempotency_keys WHERE key = %s AND created_at >= %s"
        self.cursor.execute(query, (key, datetime.utcnow() - self.key_expiry_time))
        return self.cursor.fetchone()

    def register_request(self, key):
        query = "INSERT INTO idempotency_keys (key, created_at) VALUES (%s, %s)"
        self.cursor.execute(query, (key, datetime.utcnow()))
        self.connection.commit()

    def store_response(self, key, response):
        query = "UPDATE idempotency_keys SET response = %s WHERE key = %s"
        self.cursor.execute(query, (response, key))
        self.connection.commit()

    def mark_failed(self, key):
        query = "DELETE FROM idempotency_keys WHERE key = %s"
        self.cursor.execute(query, (key,))
        self.connection.commit()

    def cleanup_expired(self):
        query = "DELETE FROM idempotency_keys WHERE created_at < %s"
        self.cursor.execute(query, (datetime.utcnow() - self.key_expiry_time,))
        self.connection.commit()

    def get_statistics(self):
        query = "SELECT COUNT(*) FROM idempotency_keys"
        self.cursor.execute(query)
        return self.cursor.fetchone()[0]

    def close(self):
        self.cursor.close()
        self.connection.close()