-- Migration 003: AI Agents and AP2 Protocol Tables
-- Create tables for AI agents, consensus, and payment mandates

-- AI Agents
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    public_key TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
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
CREATE TABLE IF NOT EXISTS agent_actions (
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

-- Consensus Transactions
CREATE TABLE IF NOT EXISTS consensus_transactions (
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
CREATE TABLE IF NOT EXISTS consensus_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consensus_transaction_id UUID NOT NULL REFERENCES consensus_transactions(id) ON DELETE CASCADE,
    validator_agent_id UUID NOT NULL REFERENCES ai_agents(id),
    vote BOOLEAN NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consensus_transaction_id, validator_agent_id)
);

-- Payment Mandates
CREATE TABLE IF NOT EXISTS payment_mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandate_id VARCHAR(255) UNIQUE NOT NULL,
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    mandate_type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description TEXT,
    signature TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Policies
CREATE TABLE IF NOT EXISTS payment_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL,
    threshold_amount DECIMAL(20, 8),
    required_signatures INT,
    time_window_hours INT,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent_id ON agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_consensus_txn_status ON consensus_transactions(status);
CREATE INDEX IF NOT EXISTS idx_consensus_votes_txn_id ON consensus_votes(consensus_transaction_id);
CREATE INDEX IF NOT EXISTS idx_mandates_agent_id ON payment_mandates(agent_id);
CREATE INDEX IF NOT EXISTS idx_mandates_expires ON payment_mandates(expires_at);

-- Triggers
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_policies_updated_at BEFORE UPDATE ON payment_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Check spending limit function
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
