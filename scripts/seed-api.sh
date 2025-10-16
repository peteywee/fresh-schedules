#!/usr/bin/env bash
set -euo pipefail

# Seed the running API by POSTing shifts using the x-role header (manager/admin required)
# Usage: scripts/seed-api.sh [HOST]
HOST=${1:-http://localhost:3333}

echo "Seeding via API at $HOST"

curl -s -X POST "$HOST/api/shifts" -H "Content-Type: application/json" -H "x-role: manager" -d '{"orgId":"seed-org","eventId":"opening","role":"Manager","staffUid":"alice","startTime":"2025-10-20T09:00:00Z","endTime":"2025-10-20T17:00:00Z"}' -w "\nHTTP_STATUS:%{http_code}\n"

curl -s -X POST "$HOST/api/shifts" -H "Content-Type: application/json" -H "x-role: manager" -d '{"orgId":"seed-org","eventId":"closing","role":"Staff","staffUid":"bob","startTime":"2025-10-20T13:00:00Z","endTime":"2025-10-20T21:00:00Z"}' -w "\nHTTP_STATUS:%{http_code}\n"

echo "Done"
