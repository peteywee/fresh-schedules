# Fresh Schedules — Seeder

## What it does
- Creates 2 example orgs (Top Shelf Service, Lone Star Coffee)
- 12 users total (admin/manager/staff mix), deterministic emails
- Memberships with roles: `['admin','manager']` for managers, `['staff']` for staff
- 3 locations per org (Texas cities)
- Labor settings per org (avg wage, labor %)
- Forecasts for N weeks (default 2): daily records with `forecastSales`, `allowedDollars`, `allowedHours`
- Weekly schedules and realistic open/mid/close shifts

## Prereqs
- Node 20+, pnpm
- Firebase CLI if using emulator
- Either Firestore Emulator OR a GCP service account with Firestore access

## Install
```bash
pnpm add -D ts-node typescript
pnpm add firebase-admin @faker-js/faker zod date-fns
