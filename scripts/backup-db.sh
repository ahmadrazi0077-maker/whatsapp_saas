#!/bin/bash

# Database backup script

# Configuration
BACKUP_DIR="./backups"
DB_NAME="whatsapp_saas"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "📦 Creating database backup..."
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
echo "🗜️ Compressing backup..."
gzip $BACKUP_FILE

# Keep only last 30 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: ${BACKUP_FILE}.gz"