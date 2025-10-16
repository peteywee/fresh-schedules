# Fresh Schedules

Compliance-first staff scheduling PWA (Top Shelf Service LLC).

## Branch policy

- **main**: production code only (protected, green CI required)
- **develop**: active integration (no docs/notes/todos)
- **notes**: personal docs/bibles/walkthroughs/research/todos

## Objective (CEO KPI)

- Onboarding → published first schedule: < 15 minutes
- Routine weekly scheduling after onboarding: **< 5 minutes**

## Testing

### E2E Tests

Run e2e tests with:

```bash
pnpm --filter @apps/web test:e2e
```

This uses Playwright to test the sign-in page.

