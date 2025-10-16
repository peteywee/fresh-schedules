# Performance Baseline

This document establishes a baseline for performance metrics after the refactoring for speed and optimization.

## Build Metrics
- **Build Time**: ~23.6 seconds (pnpm build, optimized)
- **Bundle Sizes**:
  - / page: 175 B (First Load JS: 96.1 kB)
  - /schedule page: 2.73 kB (First Load JS: 89.9 kB)
  - /signin page: 15.5 kB (First Load JS: 111 kB)
  - Shared chunks: 87.2 kB (chunks/336: 31.6 kB, chunks/de1c7e92: 53.6 kB)
- **Compilation**: Successful with no errors
- **Linting/Type Checking**: Passed
- **Tree Shaking**: Enabled via Next.js config, minification active
- **Code Splitting**: Wizard steps lazy loaded, reducing initial bundle size

## Test Results
- **Unit Tests**: 2 passed (mcp-server package)
- **E2E Tests**: Playwright tests running (status pending)
- **API Tests**:
  - Health endpoint: 200 OK
  - Status endpoint: 200 OK
  - Shifts POST: 202 Accepted (persisted: false, reason: firestore_not_configured)
- **Request Logging**: Enabled (logs method, URL, IP)

## Component Performance Optimizations
- **ScheduleWizard**: Uses useReducer for state management, React.memo, useMemo for renderStepContent, useCallback for handlers
- **ScheduleCalendar**: React.memo, useMemo for grouped shifts, useCallback for click handler
- **HoursChart**: React.memo, useMemo for computed data
- **Wizard Steps**: Lazy loaded with Suspense, split into separate components for code splitting

## API Optimizations
- **Middleware**: Request logging, error handling, CORS
- **Error Handling**: Centralized with logging
- **Caching**: In-memory cache for shifts (5min TTL) with fallback to cache on Firestore failure
- **Firebase**: Graceful fallback when not configured

## Future Comparisons
Use this baseline to measure improvements in:
- Build times
- Bundle sizes
- Rendering performance (e.g., Lighthouse scores)
- API response times
- Test execution times

Date: 2025-10-16
