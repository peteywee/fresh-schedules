# Fresh Schedules

Fresh Schedules is a compliance-first staff scheduling Progressive Web App (PWA) developed for Top Shelf Service LLC. It aims to streamline the process of creating and managing staff schedules while ensuring compliance with labor regulations.

## Key Objectives

- **Rapid Onboarding**: A new user should be able to go from signing up to publishing their first schedule in under 15 minutes.
- **Efficient Weekly Scheduling**: Routine weekly scheduling for an existing user should take less than 5 minutes.

## Getting Started

To get the project up and running on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version specified in `.nvmrc`)
- [pnpm](https://pnpm.io/)
- [Firebase account](https://firebase.google.com/) and a new project set up.

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/peteywee/fresh-schedules.git
    cd fresh-schedules
    ```
2.  **Set up environment variables:**
    
    For detailed environment setup instructions, see [docs/guides/environment-setup.guide.md](docs/guides/environment-setup.guide.md).
    
    Quick setup:
    ```bash
    # Web app
    cp apps/web/.env.example apps/web/.env.local
    # Edit apps/web/.env.local with your Firebase config
    
    # API service
    cp services/api/.env.example services/api/.env
    # Edit services/api/.env with your Firebase Admin SDK credentials
    ```

3. **Install dependencies:**

    ```bash
    pnpm install
    ```

4. **Run the development server:**

    ```bash
    pnpm dev
    ```

    The web application will be available at `http://localhost:3000`.

## Project Structure

This repository is a pnpm monorepo. The code is organized into several packages and applications:

-   `apps/web`: The main Next.js web application.
-   `packages/mcp-server`: A local express server for development purposes.
-   `packages/types`: Shared TypeScript types and Zod schemas.
-   `functions`: Firebase Cloud Functions.
-   `docs`: Project documentation.
-   `scripts`: Utility scripts.
-   `services/api`: Express API service for backend operations.

## Testing

### E2E Tests

The project uses Playwright for end-to-end testing. To run the E2E tests for the web app, use the following command:

```bash
pnpm --filter @apps/web test:e2e
```

This command specifically targets the web application and runs tests, such as the sign-in page test.

## Deployment

The application is deployed to Firebase. The deployment process is managed through Firebase CLI and GitHub Actions.

## File Tagging and Metadata System

This repository includes an automated file tagging and metadata system designed to analyze and categorize all files hierarchically. The system is built to evolve into a reusable GitHub app for enhanced repository management.

### Features

- **Hierarchical Tagging**: Files are tagged by scope (e.g., frontend, backend), folder (e.g., components, lib), file action (e.g., renders, handles, defines), and attributes (e.g., button, authentication).
- **Automated Analysis**: A Node.js script (`scripts/generate-file-metadata.mjs`) traverses the repository, extracts patterns from file content, and generates metadata.
- **CI/CD Integration**: GitHub Actions workflow (`.github/workflows/file-tagging.yml`) automatically updates metadata on pushes/PRs to main/develop branches.
- **Performance Benchmarks**: Targets <5 seconds per file processing, >90% accuracy in tagging.
- **Open Source**: Licensed under MIT, enabling reuse as a GitHub app.

### Usage

#### Manual Generation
Run the metadata generation script locally:
```bash
node scripts/generate-file-metadata.mjs
```
This updates `file-metadata.json` with current file metadata.

#### Automated Updates
The system runs automatically on GitHub via the workflow. Metadata is committed back to the repository if changes are detected.

#### Querying Metadata
Access `file-metadata.json` to query file information. Example structure:
```json
{
  "apps/web/src/components/app/schedule-wizard.tsx": {
    "language": "typescript",
    "framework": "react",
    "scope": "frontend",
    "folder": "app",
    "action": "renders",
    "attributes": ["wizard", "button", "scheduling"]
  }
}
```

### Benchmarks and Acceptance Criteria

- **Performance**: Average <5s per file (current: ~25ms/file).
- **Accuracy**: >90% correct tagging (verified on samples).
- **Success Markers**: All files tagged, no CI errors, metadata queryable.
- **Rules/Constraints**: MIT license, no data collection, skips binaries/.gitignore, handles large repos asynchronously.

### Deploying as GitHub App

To deploy this system as a reusable GitHub app:
1. Create a separate repository for the tagging system.
2. Clone the script, workflow, and metadata logic.
3. Set up GitHub App permissions for repository read/write.
4. Deploy as a webhook-triggered service.

## Contributing

Contributions are welcome. Please adhere to the following branch policy:

- **main**: Production code only. Protected branch with required green CI.
- **develop**: Active integration branch. No personal docs, notes, or TODOs.
- **notes**: Personal branches for documentation, research, and todos.
