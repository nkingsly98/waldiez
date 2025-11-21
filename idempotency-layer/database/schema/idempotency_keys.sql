-- PostgreSQL schema
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_expires_at ON idempotency_keys (expires_at);

CREATE OR REPLACE FUNCTION cleanup_expired() RETURNS VOID AS $$
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to run cleanup_expired on a schedule
CREATE TRIGGER trigger_cleanup_expired
AFTER INSERT OR UPDATE ON idempotency_keys
FOR EACH ROW EXECUTE PROCEDURE cleanup_expired();
