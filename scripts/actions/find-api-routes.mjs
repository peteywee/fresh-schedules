#!/usr/bin/env node
// Find all API routes
const routes = [
  "apps/web/public/sw.js",
  "packages/mcp-server/src/index.ts",
  "packages/mcp-server/test/auth.test.ts",
  "packages/mcp-server/test/files.test.ts",
  "packages/mcp-server/test/health.test.ts",
  "scripts/zencoder/submit-job.ts",
  "services/api/src/routes/shifts.ts",
  "services/api/src/index.ts",
  "apps/web/app/api/invite/generate/route.ts",
  "apps/web/app/api/invite/redeem/route.ts",
  "fresh-schedules-merged/packages/mcp-server/src/index.ts",
  "fresh-schedules-merged/packages/mcp-server/test/health.test.ts",
  "fresh-schedules-merged/services/api/src/routes/shifts.ts",
  "fresh-schedules-merged/services/api/src/index.ts",
  "legacy/apps/web/app/api/invite/generate/route.ts",
  "legacy/apps/web/app/api/invite/redeem/route.ts",
  "legacy/packages/mcp-server/src/index.ts",
  "legacy/packages/mcp-server/test/health.test.ts",
  "legacy/services/api/src/routes/shifts.ts",
  "legacy/services/api/src/index.ts"
];
console.log('API Routes:');
routes.forEach(r => console.log(' - ' + r));

// Action: Test API endpoints
console.log('\nSuggested Actions:');
console.log('1. Run API tests: npm run test:api');
console.log('2. Check API documentation: npm run api-docs');
console.log('3. Validate OpenAPI spec: npm run validate-api');
