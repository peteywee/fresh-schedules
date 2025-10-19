# MCP Server Setup Guide

This document describes the Model Context Protocol (MCP) server setup for Fresh Schedules, including two server implementations and configuration for AI assistants.

## Overview

The Fresh Schedules repository includes two MCP server implementations:

1. **HTTP Server** (legacy, but still functional)
   - Located: `packages/mcp-server/src/index.ts`
   - Port: 4002 (configurable via `PORT` env var)
   - Use: Local development, custom integrations

2. **Stdio Server** (modern MCP standard, recommended)
   - Located: `packages/mcp-server/src/stdio-server.ts`
   - Communication: stdin/stdout
   - Use: Claude Desktop, native MCP clients

## Quick Start

### Option 1: Run HTTP Server (Development)

```bash
# From repository root
pnpm --filter @packages/mcp-server dev
```

The server will start on `http://localhost:4002`

**Available endpoints:**
- `GET /health` — Health check
- `GET /files?path=...` — List directory contents
- `GET /context?path=...` — Read file contents

### Option 2: Run stdio Server (Recommended)

```bash
# From repository root
pnpm --filter @packages/mcp-server dev:stdio
```

**Tools provided:**
- `list_files` — List files/directories
- `read_file` — Read file contents
- `repo_info` — Repository information

## VS Code Integration

### Using Tasks

Open `Terminal → Run Task...` and choose:

- **MCP: Start HTTP Server** — Runs the HTTP server on port 4002
- **MCP: Start stdio Server (dev)** — Runs the stdio server in development mode

### Using Launch Configurations

Open `Run and Debug` (Ctrl+Shift+D / Cmd+Shift+D) and choose:

- **Debug MCP Server (stdio)** — Debug the stdio server
- **Debug MCP Server (HTTP)** — Debug the HTTP server

## Production Build

```bash
# Build the MCP server package
pnpm --filter @packages/mcp-server build

# Run compiled HTTP server
pnpm --filter @packages/mcp-server start

# Run compiled stdio server
pnpm --filter @packages/mcp-server start:stdio
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_REPO_ROOT` | Computed from __dirname | Repository root path |
| `PORT` | 4002 | HTTP server port (HTTP only) |
| `MCP_TOKEN` | (none) | Optional auth token via `x-mcp-token` header (HTTP only) |

## Claude Desktop Configuration

To use this MCP server with Claude Desktop, add it to your `claude_desktop_config.json`:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["/path/to/fresh-schedules/packages/mcp-server/dist/stdio-server.js"],
      "env": {
        "MCP_REPO_ROOT": "/path/to/fresh-schedules"
      }
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["C:\\path\\to\\fresh-schedules\\packages\\mcp-server\\dist\\stdio-server.js"],
      "env": {
        "MCP_REPO_ROOT": "C:\\path\\to\\fresh-schedules"
      }
    }
  }
}
```

> **Note:** Replace `/path/to/fresh-schedules` with the actual absolute path to your repository.

## Architecture

### HTTP Server

The HTTP server is a simple Express.js application that:
- Exposes filesystem operations via REST endpoints
- Supports optional token-based authentication
- Allows CORS for cross-origin requests
- Reads files relative to `MCP_REPO_ROOT`

**Request/Response Format:**

```bash
# List files
curl http://localhost:4002/files?path=apps/web

# Response
{
  "path": "apps/web",
  "items": [
    { "name": "package.json", "path": "apps/web/package.json", "isDirectory": false },
    { "name": "src", "path": "apps/web/src", "isDirectory": true }
  ]
}
```

### Stdio Server

The stdio server implements the modern Model Context Protocol:
- Uses stdin/stdout for communication (no HTTP needed)
- Provides tools for file operations and repo information
- Provides resources for browsing repository files
- Complies with MCP specification v1.0

**Tools:**

1. **list_files**
   ```json
   {
     "name": "list_files",
     "arguments": { "path": "." }
   }
   ```

2. **read_file**
   ```json
   {
     "name": "read_file",
     "arguments": { "path": "README.md" }
   }
   ```

3. **repo_info**
   ```json
   {
     "name": "repo_info",
     "arguments": {}
   }
   ```

## Security Considerations

### HTTP Server
- ⚠️ **Warning:** By default, the HTTP server has no authentication.
- Set `MCP_TOKEN` environment variable to require `x-mcp-token` header:
  ```bash
  MCP_TOKEN=your-secret-token pnpm --filter @packages/mcp-server start
  ```
- Only expose locally or behind authentication proxy in production.

### Stdio Server
- Safer for local use (controlled via parent process).
- No network exposure by default.
- Only allow trusted processes to execute the server.

### Path Security
Both servers validate paths to prevent directory traversal attacks:
- All paths must resolve inside `MCP_REPO_ROOT`
- Requests for paths outside the repo are rejected with `400 Bad Request`

## Testing

Run the test suite:

```bash
pnpm --filter @packages/mcp-server test
```

## Troubleshooting

### Server doesn't start

**HTTP Server:**
```bash
# Check if port is in use
lsof -i :4002  # macOS/Linux
netstat -ano | findstr :4002  # Windows

# Try a different port
PORT=4003 pnpm --filter @packages/mcp-server start
```

**Stdio Server:**
```bash
# Check for TypeScript compilation errors
pnpm --filter @packages/mcp-server build

# Run with debug output
MCP_REPO_ROOT=/path/to/repo node packages/mcp-server/dist/stdio-server.js 2>&1
```

### Path resolution errors

Ensure `MCP_REPO_ROOT` is set correctly:
```bash
# Check current value
echo $MCP_REPO_ROOT

# Set explicitly
export MCP_REPO_ROOT=/home/patrick/fresh-schedules/fresh-root
```

### Claude Desktop integration not working

1. Verify the full path to `stdio-server.js` is correct
2. Ensure the path exists: `ls -la /path/to/dist/stdio-server.js`
3. Check Claude's logs: `~/Library/Application Support/Claude/claude.log` (macOS)
4. Rebuild the package: `pnpm --filter @packages/mcp-server build`
5. Restart Claude Desktop

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Model Context Protocol GitHub](https://github.com/modelcontextprotocol)
- [Claude Desktop Documentation](https://www.notion.so/Claude-Desktop-60e2ef4b1d2f4c7e8b6f9a1c2d3e4f5g)