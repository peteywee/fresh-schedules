#!/usr/bin/env node
// Find all test files
const tests = [
  "apps/web/tests/e2e/signin.debug.spec.ts",
  "apps/web/tests/e2e/signin.spec.ts",
  "docs/fixes/pr-27-code-suggestions-fix.md",
  "packages/mcp-server/src/stdio-server.ts",
  "packages/mcp-server/test/repo-root.test.ts",
  "packages/mcp-server/test/run-basic-test.js",
  "services/api/src/middleware/auth.ts",
  "services/api/src/seed.ts",
  "docs/SECURITY_USAGE.md",
  "functions/src/attendance.ts",
  "scripts/seed/seed.ts",
  "packages/schemas/src/index.ts",
  "packages/types/src/shift.schema.ts",
  "apps/web/src/ai/flows/generate-labor-plan.ts",
  "apps/web/src/ai/flows/get-forecast-recommendations.ts",
  "apps/web/src/ai/genkit.ts",
  "apps/web/src/components/layout/header.tsx",
  "fresh-schedules-merged/apps/web/src/ai/flows/generate-labor-plan.ts",
  "fresh-schedules-merged/apps/web/src/ai/flows/get-forecast-recommendations.ts",
  "fresh-schedules-merged/apps/web/src/ai/genkit.ts",
  "fresh-schedules-merged/apps/web/src/components/layout/header.tsx",
  "fresh-schedules-merged/apps/web/tests/e2e/signin.spec.ts",
  "fresh-schedules-merged/packages/mcp-server/test/files.test.ts",
  "fresh-schedules-merged/packages/mcp-server/test/run-basic-test.js",
  "fresh-schedules-merged/packages/schemas/src/index.ts",
  "fresh-schedules-merged/packages/types/src/shift.schema.ts",
  "legacy/apps/web/src/components/app/schedule-calendar.tsx",
  "legacy/apps/web/tests/e2e/signin.spec.ts",
  "legacy/packages/mcp-server/test/files.test.ts",
  "legacy/packages/mcp-server/test/run-basic-test.js",
  "legacy/packages/schemas/src/index.ts",
  "legacy/packages/types/src/shift.schema.ts"
];
console.log('Test Files:');
tests.forEach(t => console.log(' - ' + t));

// Action: Run test coverage analysis
console.log('\nSuggested Actions:');
console.log('1. Run all tests: npm test');
console.log('2. Generate coverage: npm run test:coverage');
console.log('3. Check test quality: npm run test:quality');
