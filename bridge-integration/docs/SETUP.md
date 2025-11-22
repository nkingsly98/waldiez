# Setup Guide

Complete setup instructions for the Bridge API integration.

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+
- **PostgreSQL** 14+
- **Redis** (optional, for caching)
- **Git**

## Quick Start

Clone and setup in 15 minutes:

```bash
# Clone repository
git clone <repository-url>
cd bridge-integration

# Install dependencies
npm install
pip install -r sdk/python/requirements.txt

# Setup database
psql -U postgres -c "CREATE DATABASE bridge_db;"
psql -U postgres bridge_db < database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start backend
npm run backend

# Start frontend (in new terminal)
npm run frontend
```

## Detailed Setup

### 1. Database Setup

#### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE bridge_db;
CREATE USER bridge_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bridge_db TO bridge_user;
\q
```

#### Run Migrations

```bash
# Option 1: Use complete schema
psql -U bridge_user bridge_db < database/schema.sql

# Option 2: Use migrations
psql -U bridge_user bridge_db < database/migrations/001_initial_setup.sql
psql -U bridge_user bridge_db < database/migrations/002_bridge_integration.sql
psql -U bridge_user bridge_db < database/migrations/003_ai_agents.sql
```

### 2. Environment Configuration

Create `.env` file in project root:

```bash
# Bridge API
BRIDGE_API_KEY=your_bridge_api_key_here
BRIDGE_ENVIRONMENT=sandbox

# Database
DATABASE_URL=postgresql://bridge_user:your_password@localhost:5432/bridge_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bridge_db
DB_USER=bridge_user
DB_PASSWORD=your_password

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_here

# AP2/X402
AP2_ENABLED=true
X402_ENABLED=true

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Redis
REDIS_URL=redis://localhost:6379
```

### 3. SDK Setup

#### Python SDK

```bash
cd sdk/python
pip install -r requirements.txt

# Test installation
python -c "from bridge_sdk import create_bridge_client; print('OK')"
```

#### TypeScript SDK

```bash
cd sdk/typescript
npm install
npm run build

# Test installation
npm test
```

### 4. Backend Setup

```bash
cd backend
npm install

# Run migrations (if not done)
npm run migrate

# Start development server
npm run dev

# Or production mode
npm run build
npm start
```

### 5. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### 6. Verify Installation

Test the setup:

```bash
# Test database connection
psql -U bridge_user bridge_db -c "SELECT * FROM users LIMIT 1;"

# Test backend health
curl http://localhost:3000/health

# Test frontend
open http://localhost:3001
```

## Development Workflow

### Running Services

Use separate terminals:

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Database (if needed)
# PostgreSQL should run as a service
```

### Using Docker Compose

Alternatively, use Docker:

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:integration
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:e2e
```

### SDK Tests

```bash
# Python
cd sdk/python
pytest

# TypeScript
cd sdk/typescript
npm test
```

## Common Issues

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U bridge_user bridge_db

# Reset password if needed
psql -U postgres
ALTER USER bridge_user WITH PASSWORD 'new_password';
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Missing Dependencies

```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install

# Python dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup instructions.

## Next Steps

1. Complete KYC onboarding at `/onboarding`
2. Create your first wallet
3. Configure AI agents
4. Set up webhooks
5. Integrate into your application

## Support

- Documentation: [API.md](./API.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Examples: [EXAMPLES.md](./EXAMPLES.md)
