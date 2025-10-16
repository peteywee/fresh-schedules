# Refactoring Plan for Speed and Optimization

## React Components Optimization (Speed Focus)

- [x] Create custom hooks (e.g., useScheduleState) in apps/web/src/hooks/
- [x] Refactor ScheduleWizard to use useReducer for state management
- [x] Add React.memo, useMemo, useCallback to ScheduleWizard steps
- [x] Memoize calculations in ScheduleCalendar (grouped shifts, format functions)
- [x] Add React.memo, useMemo to ScheduleCalendar component
- [x] Memoize hours calculation in HoursChart
- [x] Add React.memo to HoursChart component

## Code Structure

- [ ] Organize components into subfolders if needed
- [ ] Standardize naming and improve type definitions

## API Optimization

- [x] Add middleware for error handling, logging, CORS in services/api/src/index.ts
- [x] Optimize shifts route in services/api/src/routes/shifts.ts

## Bundle and Build

- [x] Add dynamic imports for wizard steps in ScheduleWizard
- [x] Update package.json scripts for better performance
- [x] Ensure tree shaking and minification

## Other Factors

- [x] Update lint script to actual ESLint in package.json
- [ ] Add service worker caching for static assets
- [ ] Review Firebase config loading

## Followup

- [x] Run tests and build
- [x] Measure performance improvements (baseline established)
- [ ] Test in browser (pending user interaction)
