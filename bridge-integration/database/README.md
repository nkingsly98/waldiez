# Database Schema

Complete PostgreSQL database schema for Bridge API integration.

## Overview

This directory contains the database schema and migrations for the Bridge payment platform integration with AI agents.

## Files

- `schema.sql` - Complete database schema (all-in-one)
- `migrations/` - Individual migration files for incremental setup

## Setup

### Option 1: Use Complete Schema

```bash
psql -U postgres -d your_database < schema.sql
```

### Option 2: Run Migrations

```bash
psql -U postgres -d your_database < migrations/001_initial_setup.sql
psql -U postgres -d your_database < migrations/002_bridge_integration.sql
psql -U postgres -d your_database < migrations/003_ai_agents.sql
```

## Schema Components

### Core Tables

1. **users** - User authentication and profiles
2. **bridge_customers** - Bridge API customer records
3. **crypto_wallets** - Cryptocurrency wallets
4. **external_accounts** - External bank accounts
5. **bridge_transactions** - Payment transactions

### AI Agent Tables

6. **ai_agents** - AI agent configurations
7. **agent_actions** - Log of agent actions
8. **consensus_transactions** - Multi-agent consensus transactions
9. **consensus_votes** - Votes from validator agents
10. **payment_mandates** - AP2 protocol payment mandates
11. **payment_policies** - Payment limits and multi-sig policies

### Audit Tables

12. **audit_logs** - System-wide audit trail
13. **webhook_events** - Webhook event queue

## Features

- **UUID Primary Keys** - Using uuid-ossp extension
- **Automatic Timestamps** - created_at, updated_at with triggers
- **Indexes** - Optimized for common queries
- **Foreign Keys** - Referential integrity
- **Check Constraints** - Data validation
- **Triggers** - Automatic spending limit checks
- **Views** - Common query patterns
- **Comments** - Table and column documentation

## Security

- Encrypted password storage (use bcrypt)
- Agent spending limits enforced by triggers
- Byzantine fault tolerance for multi-agent consensus
- Audit logging for all actions

## Performance

All tables have appropriate indexes for:
- Foreign key relationships
- Status fields
- Timestamp ranges
- Email and ID lookups
