#!/usr/bin/env bash
set -euo pipefail

echo "▶ Repo-tracked hard reset: install deps and build workspace (sequential)"

echo "▶ Installing dependencies (pnpm install)"
pnpm install

echo "▶ Building workspace projects sequentially"
echo " - packages/types (if present)"
pnpm --filter @packages/types build || true

echo " - services/api"
pnpm --filter services/api build

echo " - apps/web"
pnpm --filter @apps/web build

echo "▶ Hard reset complete"
