#!/bin/bash

# Deployment script for WhatsApp SaaS

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm run setup

# Run database migrations
echo "🗄️ Running database migrations..."
npm run prisma:migrate

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Build applications
echo "🏗️ Building applications..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart ecosystem.config.js

# Run database backup
echo "💾 Backing up database..."
./scripts/backup-db.sh

echo "✅ Deployment completed successfully!"