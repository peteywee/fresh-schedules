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

Fresh Schedules is a compliance-first staff scheduling Progressive Web App (PWA) developed for Top Shelf Service LLC. It streamlines the process of creating and managing staff schedules while ensuring compliance with labor regulations.

## Repository Structure

The repository is organized as a pnpm monorepo with multiple packages and applications:

### Main Repository Components

- **apps/web**: Next.js web application with App Router architecture
- **services/api**: Express API service for backend functionality
- **packages/types**: Shared TypeScript types and Zod schemas
- **packages/mcp-server**: Local helper service for development
- **functions**: Firebase Cloud Functions
- **firebase**: Firebase configuration files
- **scripts**: Automation scripts for deployment and CI/CD

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

**Configuration File**: apps/web/package.json

#### Web Application - Language & Runtime

**Language**: TypeScript
**Version**: TypeScript 5.5.4
**Framework**: Next.js 14.2.32
**Package Manager**: pnpm 9.0.0

#### Web Application - Dependencies

**Main Dependencies**:

- React 18.2.0
- Firebase 10.13.1
- Zod 3.23.8
- Lucide React 0.545.0

#### Web Application - Build & Installation

```bash
pnpm --filter @apps/web install
pnpm --filter @apps/web dev
pnpm --filter @apps/web build
```

#### Testing

**Framework**: Playwright
**Test Location**: apps/web/tests/e2e
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
### API Service (Express)

**Configuration File**: services/api/package.json

#### API Service - Language & Runtime

**Language**: TypeScript
**Version**: TypeScript 5.9.3
**Framework**: Express 5.1.0
**Package Manager**: pnpm 9.0.0

#### API Service - Dependencies

**Main Dependencies**:

- Express 5.1.0
- Firebase Admin 12.0.0
- Zod 4.1.12
- CORS 2.8.5
- Pino 10.0.0

#### API Service - Build & Installation

```bash
pnpm --filter @services/api install
pnpm --filter @services/api dev
pnpm --filter @services/api build
```

### Shared Types Package

**Configuration File**: packages/types/package.json

#### Shared Types - Language & Runtime

**Language**: TypeScript
**Version**: TypeScript 5.9.3
**Package Manager**: pnpm 9.0.0

#### Shared Types - Dependencies

**Main Dependencies**:

- Zod 4.1.12

### Firebase Functions

**Configuration File**: functions/package.json

#### Firebase Functions - Language & Runtime

**Language**: TypeScript
**Framework**: Firebase Functions
**Package Manager**: npm

#### Firebase Functions - Build & Installation

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
```

## Firebase Configuration

**Configuration Files**:

- firebase.json
- .firebaserc
- firebase/firestore.rules
- firebase/storage.rules

**Emulators**:

- Firestore emulator on port 8080

## Development Workflow

**Install Dependencies**:

```bash
pnpm -w install
```

**Start Development Servers**:

```bash
pnpm dev:web  # Next.js app on port 3000
pnpm dev:api  # Express API on port 3333
```

**Build All Projects**:

```bash
pnpm build
```

**Type Checking**:

```bash
pnpm typecheck
```
