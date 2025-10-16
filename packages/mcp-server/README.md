# MCP Server (local)

This minimal MCP (Model Context Provider) server serves repository files and a small API used by local Copilot/MCP integrations.

Features:

- GET /health — simple health check
- GET /files?path=... — list directory entries relative to repo root
- GET /context?path=... — return file contents for a path inside the repo

## How to run locally

1. From repository root, install dependencies and build the package:

```bash
pnpm -w install
pnpm --filter @packages/mcp-server build
```

2. Run the server:

```bash
pnpm --filter @packages/mcp-server start
```

Or run in dev mode:

```bash
pnpm --filter @packages/mcp-server dev
```

## Testing

Run the test suite:

```bash
pnpm --filter @packages/mcp-server test
```

The test suite includes integration tests for:
- Health endpoint with optional authentication
- Files endpoint with path safety checks
- Context endpoint with path safety checks and content reading

## CI/CD

The package is built and tested automatically on `main` and `develop` branches, and on a daily schedule via GitHub Actions (`.github/workflows/mcp-server.yml`).

## Security

This server reads files from the repository and should only be run in local or trusted environments. Do not expose it publicly without adding authentication and access controls.

Optional authentication can be enabled by setting the `MCP_TOKEN` environment variable. When set, all requests must include a matching `x-mcp-token` header.
