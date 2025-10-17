---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary

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
