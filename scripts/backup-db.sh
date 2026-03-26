#!/bin/bash

# Configuration
DB_PATH="./prisma/dev.db"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/backup-$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Execute backup (using sqlite3 .backup for safety, or simple cp)
if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_PATH" ".backup '$BACKUP_PATH'"
    echo "✅ SQLite backup created correctly using sqlite3: $BACKUP_PATH"
else
    cp "$DB_PATH" "$BACKUP_PATH"
    echo "✅ SQLite backup created using cp: $BACKUP_PATH"
fi

# Keep only the last 30 backups (optional)
# ls -t $BACKUP_DIR/backup-*.db | tail -n +31 | xargs -r rm --
