# E2E Tests

End-to-end tests for the Fresh Schedules web application using Playwright.

## Prerequisites

1. Install Playwright browsers:

```bash
npx playwright install chromium
```

Or install all browsers with system dependencies:

```bash
npx playwright install --with-deps
```

2. Ensure you have a `.env.local` file in `apps/web/` with the required Firebase configuration:

```bash
cp .env.local.example .env.local
```

## Running Tests

From the repository root or the `apps/web` directory:

```bash
# Run all tests
pnpm --filter @apps/web test:e2e

# Run tests in UI mode (interactive)
pnpm --filter @apps/web test:e2e:ui

# Run tests in headed mode (see browser)
pnpm --filter @apps/web test:e2e:headed
```

## Test Structure

Tests are located in `apps/web/tests/e2e/`:

- `signin.spec.ts` - Tests for the sign-in page flow
- `signin.debug.spec.ts` - Development/debugging version with console logging and HTML snapshots

## Configuration

Playwright is configured in `apps/web/playwright.config.ts` with:

- Test timeout: 60 seconds
- Dev server auto-start on `http://localhost:3000`
- Multi-browser support (Chromium, Firefox, Safari/WebKit)
- Video and trace recording on failure

## Writing Tests

Use `data-testid` attributes for reliable element selection:

```tsx
// Component
<button data-testid="btn-submit">Submit</button>

// Test
const submitButton = page.getByTestId('btn-submit');
await expect(submitButton).toBeVisible();
```

See existing tests in `e2e/` for examples.
