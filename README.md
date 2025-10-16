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

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/fresh-schedules.git
    cd fresh-schedules
    ```
2.  **Set up environment variables:**
    Create a `.env.local` file in the `apps/web` directory and add the necessary Firebase configuration keys. You can get these from your Firebase project settings.
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```
3.  **Install dependencies:**
    ```bash
    pnpm install
    ```
4.  **Run the development server:**
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
-   `services`: External service configurations.

## Testing

### E2E Tests

The project uses Playwright for end-to-end testing. To run the E2E tests for the web app, use the following command:

```bash
pnpm --filter @apps/web test:e2e
```

This command specifically targets the web application and runs tests, such as the sign-in page test.

## Deployment

The application is deployed to Firebase. The deployment process is managed through Firebase CLI and GitHub Actions.

## Contributing

Contributions are welcome. Please adhere to the following branch policy:

-   **main**: Production code only. Protected branch with required green CI.
-   **develop**: Active integration branch. No personal docs, notes, or TODOs.
-   **notes**: Personal branches for documentation, research, and todos.

