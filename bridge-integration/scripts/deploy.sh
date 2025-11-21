#!/bin/bash

# Bridge Integration Deployment Script
# Deploys the application to production

set -e

echo "🚀 Bridge Integration Deployment"
echo "=================================="

# Check environment
if [ "$BRIDGE_ENVIRONMENT" != "production" ]; then
    echo "⚠️  Warning: BRIDGE_ENVIRONMENT is not set to 'production'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check required environment variables
required_vars=(
    "BRIDGE_API_KEY"
    "DATABASE_URL"
    "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables check passed"

# Run tests
echo ""
echo "🧪 Running tests..."
npm test || { echo "❌ Tests failed. Aborting deployment."; exit 1; }
echo "✅ Tests passed"

# Build applications
echo ""
echo "🔨 Building applications..."

# Build TypeScript SDK
echo "Building TypeScript SDK..."
cd sdk/typescript
npm run build
cd ../..

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build complete"

# Database migrations
echo ""
echo "🗄️  Running database migrations..."
read -p "Run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql $DATABASE_URL < database/schema.sql
    echo "✅ Migrations complete"
fi

# Deployment
echo ""
echo "📦 Deploying..."

# Option 1: Docker deployment
if command -v docker-compose &> /dev/null; then
    read -p "Deploy using Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.prod.yml up -d
        echo "✅ Docker deployment complete"
        exit 0
    fi
fi

# Option 2: PM2 deployment
if command -v pm2 &> /dev/null; then
    read -p "Deploy using PM2? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        pm2 start npm --name "bridge-backend" -- start
        cd ../frontend
        pm2 start npm --name "bridge-frontend" -- start
        cd ..
        pm2 save
        echo "✅ PM2 deployment complete"
        exit 0
    fi
fi

# Manual deployment instructions
echo ""
echo "📝 Manual deployment steps:"
echo "1. Copy built files to production server"
echo "2. Install production dependencies"
echo "3. Set environment variables"
echo "4. Start services"
echo ""
echo "Backend: cd backend && npm start"
echo "Frontend: cd frontend && npm start"
echo ""
echo "✅ Deployment preparation complete"
