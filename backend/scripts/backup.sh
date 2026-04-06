#!/usr/bin/env bash
# Daily Postgres backup. Run via Railway cron or external scheduler.
# Requires: DATABASE_URL, BACKUP_S3_BUCKET, AWS creds.
set -euo pipefail

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FILE="/tmp/venueplus-${STAMP}.sql.gz"

pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$FILE"

if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  aws s3 cp "$FILE" "s3://${BACKUP_S3_BUCKET}/db/venueplus-${STAMP}.sql.gz"
  echo "uploaded to s3://${BACKUP_S3_BUCKET}/db/venueplus-${STAMP}.sql.gz"
fi

rm -f "$FILE"
echo "backup complete: ${STAMP}"
