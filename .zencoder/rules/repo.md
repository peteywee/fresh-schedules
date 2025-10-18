---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
Fresh Schedules is a compliance-first staff scheduling Progressive Web Application (PWA) for Top Shelf Service LLC. The repository is organized as a monorepo using pnpm workspaces, containing multiple interconnected projects including a Next.js web application, API service, Firebase functions, and utility packages.

## Repository Structure
- **apps/**: Contains frontend applications (Next.js web app)
- **services/**: Backend services (API server)
- **packages/**: Shared libraries and utilities (types, mcp-server)
- **functions/**: Firebase Cloud Functions
- **scripts/**: Utility scripts including Zencoder job submission
- **docs/**: Documentation files
- **firebase/**: Firebase configuration

### Main Repository Components
- **Web App**: Next.js frontend application for staff scheduling
- **API Service**: Express-based backend service
- **MCP Server**: Shared server package
- **Firebase Functions**: Serverless functions
- **Zencoder Integration**: Video encoding job submission

## Projects

### Web Application (Next.js)
**Configuration File**: apps/web/package.json

#### Language & Runtime
**Language**: TypeScript, JavaScript
**Version**: Node.js v18+
**Framework**: Next.js 14.2.32
**Package Manager**: pnpm 9.0.0

#### Dependencies
**Main Dependencies**:
- React 18.2.0
- Next.js 14.2.32
- Firebase 10.13.1
- Zod 3.23.8
- clsx 2.1.1

#### Build & Installation
```bash
pnpm --filter @apps/web install
pnpm --filter @apps/web build
pnpm --filter @apps/web start
```

#### Testing
**Framework**: Playwright
**Test Location**: apps/web/tests
**Run Command**:
```bash
pnpm --filter @apps/web test:e2e
```

### API Service
**Configuration File**: services/api/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js v18+
**Framework**: Express 5.1.0
**Package Manager**: pnpm 9.0.0

#### Dependencies
**Main Dependencies**:
- Express 5.1.0
- Cors 2.8.5
- Pino 10.0.0
- Zod 4.1.12

#### Build & Installation
```bash
pnpm --filter @services/api install
pnpm --filter @services/api build
pnpm --filter @services/api start
```

### MCP Server Package
**Configuration File**: packages/mcp-server/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js v18+
**Framework**: Express 4.18.2
**Package Manager**: pnpm 9.0.0

#### Dependencies
**Main Dependencies**:
- Express 4.18.2
- Cors 2.8.5

#### Testing
**Framework**: Jest
**Test Location**: packages/mcp-server/test
**Run Command**:
```bash
pnpm --filter @packages/mcp-server test
```

### Firebase Functions
**Configuration File**: functions/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js v22
**Framework**: Firebase Functions 6.5.0
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- firebase-admin 13.5.0
- firebase-functions 6.5.0

#### Build & Installation
```bash
cd functions
npm install
npm run build
npm run deploy
```

### Zencoder Integration
**Configuration File**: scripts/zencoder/submit-job.ts

#### Language & Runtime
**Language**: TypeScript
**Version**: Node.js v18+
**Package Manager**: pnpm 9.0.0

#### Usage & Operations
**Key Commands**:
```bash
# Set API key
export ZENCODER_API_KEY=your_api_key_here

# Run directly with tsx
pnpm dlx tsx ./scripts/zencoder/submit-job.ts

# Or use the package script
pnpm zencoder:submit
```

#### Environment Configuration
**Required Environment Variables**:
- `ZENCODER_API_KEY`: API key for authenticating with the Zencoder service

#### VS Code Integration
**Available Tasks**:
- `Zencoder: Submit job (tsx)`: Runs the script directly using tsx