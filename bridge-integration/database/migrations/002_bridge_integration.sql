-- Migration 002: Bridge API Integration Tables
-- Create tables for Bridge customers, wallets, and transactions

-- Bridge Customers
CREATE TABLE IF NOT EXISTS bridge_customers (
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
CREATE TABLE IF NOT EXISTS crypto_wallets (
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

-- External Bank Accounts
CREATE TABLE IF NOT EXISTS external_accounts (
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

-- Bridge Transactions
CREATE TABLE IF NOT EXISTS bridge_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    bridge_transaction_id VARCHAR(255) UNIQUE,
    transaction_type VARCHAR(50) NOT NULL,
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
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES bridge_customers(id) ON DELETE CASCADE,
    bridge_card_id VARCHAR(255) UNIQUE NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    brand VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    spending_limit DECIMAL(20, 2),
    spent_amount DECIMAL(20, 2) DEFAULT 0.0,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bridge_customers_user_id ON bridge_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_bridge_customers_bridge_id ON bridge_customers(bridge_customer_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_customer_id ON crypto_wallets(customer_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_bridge_id ON crypto_wallets(bridge_wallet_id);
CREATE INDEX IF NOT EXISTS idx_external_accounts_customer_id ON external_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON bridge_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON bridge_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cards_customer_id ON cards(customer_id);

-- Triggers
CREATE TRIGGER update_bridge_customers_updated_at BEFORE UPDATE ON bridge_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_wallets_updated_at BEFORE UPDATE ON crypto_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_accounts_updated_at BEFORE UPDATE ON external_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
