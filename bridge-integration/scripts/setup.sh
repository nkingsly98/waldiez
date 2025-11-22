#!/bin/bash

# Bridge Integration Setup Script
# Sets up the complete development environment

set -e

echo "🚀 Bridge Integration Setup"
echo "=============================="

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed. Aborting." >&2; exit 1; }

echo "✅ All prerequisites met"

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "📦 Installing TypeScript SDK dependencies..."
cd sdk/typescript && npm install && cd ../..

# Install Python dependencies
echo ""
echo "🐍 Installing Python dependencies..."
cd sdk/python
pip3 install -r requirements.txt
cd ../..

# Setup environment
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please configure with your API keys)"
else
    echo "✅ .env file already exists"
fi

# Setup database
echo ""
echo "🗄️  Database setup..."
read -p "Do you want to create the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name [bridge_db]: " DB_NAME
    DB_NAME=${DB_NAME:-bridge_db}
    
    read -p "Enter database user [bridge_user]: " DB_USER
    DB_USER=${DB_USER:-bridge_user}
    
    createdb $DB_NAME 2>/dev/null || echo "Database already exists"
    psql $DB_NAME < database/schema.sql
    echo "✅ Database setup complete"
fi

# Build TypeScript SDK
echo ""
echo "🔨 Building TypeScript SDK..."
cd sdk/typescript
npm run build
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Bridge API key"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Visit http://localhost:3001 for frontend"
echo "4. Visit http://localhost:3000 for backend API"
echo ""
echo "For more information, see docs/SETUP.md"
