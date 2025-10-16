# MCP Server (local)

This minimal MCP (Model Context Provider) server serves repository files and a small API used by local Copilot/MCP integrations.

Features:

- GET /health — simple health check
- GET /files?path=... — list directory entries relative to repo root
- GET /context?path=... — return file contents for a path inside the repo

How to run locally:


1. From repository root, install dependencies and build the package:

```bash
pnpm -w install
pnpm --filter @packages/mcp-server build
```

1. Run the server:

```bash
pnpm --filter @packages/mcp-server start
```

Or run in dev mode:

```bash
pnpm --filter @packages/mcp-server dev
```

Security: This server reads files from the repository and should only be run in local or trusted environments. Do not expose it publicly without adding authentication and access controls.
