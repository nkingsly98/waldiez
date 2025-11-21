-- Complete PostgreSQL Database Schema for Bridge API Integration
-- Production-ready schema with indexes, triggers, and audit capabilities

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Bridge Customers (links to Bridge API)
CREATE TABLE bridge_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bridge_customer_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    kyc_status VARCHAR(50) DEFAULT 'not_started',
    kyc_data JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crypto Wallets
CREATE TABLE crypto_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    bridge_wallet_id VARCHAR(255) UNIQUE NOT NULL,
    wallet_type VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    address VARCHAR(255) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fiat Accounts
CREATE TABLE fiat_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- External Bank Accounts
CREATE TABLE external_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    bridge_account_id VARCHAR(255) UNIQUE,
    account_number_last_four VARCHAR(4),
    routing_number VARCHAR(20),
    account_type VARCHAR(50),
    bank_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    verification_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bridge Transactions (fiat ↔ crypto)
CREATE TABLE bridge_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    bridge_transaction_id VARCHAR(255) UNIQUE,
    transaction_type VARCHAR(50) NOT NULL, -- 'on_ramp', 'off_ramp', 'transfer'
    from_wallet_id UUID REFERENCES crypto_wallets(id),
    to_wallet_id UUID REFERENCES crypto_wallets(id),
    from_account_id UUID REFERENCES external_accounts(id),
    to_account_id UUID REFERENCES external_accounts(id),
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    fee DECIMAL(20, 8) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Cards
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    bridge_card_id VARCHAR(255) UNIQUE NOT NULL,
    card_type VARCHAR(50) NOT NULL, -- 'virtual', 'physical'
    last_four VARCHAR(4) NOT NULL,
    brand VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    spending_limit DECIMAL(20, 2),
    spent_amount DECIMAL(20, 2) DEFAULT 0.0,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents Management
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    public_key TEXT NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'initiator', 'validator', 'executor'
    is_active BOOLEAN DEFAULT true,
    wallet_id UUID REFERENCES crypto_wallets(id),
    spending_limit DECIMAL(20, 8),
    spent_amount DECIMAL(20, 8) DEFAULT 0.0,
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Actions Log
CREATE TABLE agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    transaction_id UUID REFERENCES bridge_transactions(id),
    amount DECIMAL(20, 8),
    currency VARCHAR(10),
    status VARCHAR(50) NOT NULL,
    signature TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Agent Consensus Transactions
CREATE TABLE consensus_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    initiator_agent_id UUID NOT NULL REFERENCES ai_agents(id),
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    required_votes INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    bridge_transaction_id UUID REFERENCES bridge_transactions(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Consensus Votes
CREATE TABLE consensus_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consensus_transaction_id UUID NOT NULL REFERENCES consensus_transactions(id) ON DELETE CASCADE,
    validator_agent_id UUID NOT NULL REFERENCES ai_agents(id),
    vote BOOLEAN NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consensus_transaction_id, validator_agent_id)
);

-- Payment Mandates
CREATE TABLE payment_mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandate_id VARCHAR(255) UNIQUE NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    mandate_type VARCHAR(50) NOT NULL, -- 'intent', 'cart'
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description TEXT,
    signature TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Limits and Multi-sig Policies
CREATE TABLE payment_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL, -- 'limit', 'multisig'
    threshold_amount DECIMAL(20, 8),
    required_signatures INT,
    time_window_hours INT,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Events
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES ai_agents(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bridge_customers_user_id ON bridge_customers(user_id);
CREATE INDEX idx_bridge_customers_bridge_id ON bridge_customers(bridge_customer_id);
CREATE INDEX idx_crypto_wallets_customer_id ON crypto_wallets(customer_id);
CREATE INDEX idx_crypto_wallets_bridge_id ON crypto_wallets(bridge_wallet_id);
CREATE INDEX idx_fiat_accounts_customer_id ON fiat_accounts(customer_id);
CREATE INDEX idx_external_accounts_customer_id ON external_accounts(customer_id);
CREATE INDEX idx_transactions_customer_id ON bridge_transactions(customer_id);
CREATE INDEX idx_transactions_status ON bridge_transactions(status);
CREATE INDEX idx_transactions_created ON bridge_transactions(created_at DESC);
CREATE INDEX idx_cards_customer_id ON cards(customer_id);
CREATE INDEX idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_agent_actions_agent_id ON agent_actions(agent_id);
CREATE INDEX idx_consensus_txn_status ON consensus_transactions(status);
CREATE INDEX idx_consensus_votes_txn_id ON consensus_votes(consensus_transaction_id);
CREATE INDEX idx_mandates_agent_id ON payment_mandates(agent_id);
CREATE INDEX idx_mandates_expires ON payment_mandates(expires_at);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bridge_customers_updated_at BEFORE UPDATE ON bridge_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_wallets_updated_at BEFORE UPDATE ON crypto_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fiat_accounts_updated_at BEFORE UPDATE ON fiat_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_accounts_updated_at BEFORE UPDATE ON external_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_policies_updated_at BEFORE UPDATE ON payment_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check spending limits
CREATE OR REPLACE FUNCTION check_agent_spending_limit()
RETURNS TRIGGER AS $$
DECLARE
    agent_limit DECIMAL(20, 8);
    agent_spent DECIMAL(20, 8);
BEGIN
    SELECT spending_limit, spent_amount INTO agent_limit, agent_spent
    FROM ai_agents WHERE id = NEW.agent_id;
    
    IF agent_limit IS NOT NULL AND (agent_spent + NEW.amount) > agent_limit THEN
        RAISE EXCEPTION 'Agent spending limit exceeded';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_agent_spending BEFORE INSERT ON agent_actions
    FOR EACH ROW EXECUTE FUNCTION check_agent_spending_limit();

-- Views for common queries
CREATE VIEW active_wallets AS
SELECT 
    w.id,
    w.customer_id,
    w.bridge_wallet_id,
    w.currency,
    w.balance,
    c.email as customer_email,
    c.kyc_status
FROM crypto_wallets w
JOIN bridge_customers c ON w.customer_id = c.id
WHERE w.is_active = true;

CREATE VIEW agent_spending_summary AS
SELECT 
    a.id as agent_id,
    a.agent_name,
    a.spending_limit,
    a.spent_amount,
    COUNT(aa.id) as total_actions,
    SUM(CASE WHEN aa.status = 'completed' THEN aa.amount ELSE 0 END) as completed_amount
FROM ai_agents a
LEFT JOIN agent_actions aa ON a.id = aa.agent_id
GROUP BY a.id, a.agent_name, a.spending_limit, a.spent_amount;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for the platform';
COMMENT ON TABLE bridge_customers IS 'Bridge API customer records linked to users';
COMMENT ON TABLE crypto_wallets IS 'Cryptocurrency wallets managed through Bridge';
COMMENT ON TABLE ai_agents IS 'AI agents configured for autonomous payments';
COMMENT ON TABLE consensus_transactions IS 'Multi-agent consensus payment transactions';
COMMENT ON TABLE payment_mandates IS 'AP2 protocol payment mandates';
