# MCP Quick Start Reference

## TL;DR Commands

```bash
# Build MCP server
pnpm --filter @packages/mcp-server build

# Run stdio server (recommended)
pnpm --filter @packages/mcp-server start:stdio

# Run HTTP server (development)
pnpm --filter @packages/mcp-server start

# Develop with hot reload (stdio)
pnpm --filter @packages/mcp-server dev:stdio

# Develop with hot reload (HTTP)
pnpm --filter @packages/mcp-server dev
```

## VS Code Quick Start

### Run Tasks
1. `Ctrl+Shift+P` → "Run Task"
2. Choose:
   - **MCP: Start stdio Server (dev)** (recommended)
   - **MCP: Start HTTP Server**

### Debug
1. `Ctrl+Shift+D` → Choose debugger
2. Select:
   - **Debug MCP Server (stdio)**
   - **Debug MCP Server (HTTP)**

## Claude Desktop Setup

```json
{
  "mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["/home/patrick/fresh-schedules/fresh-root/packages/mcp-server/dist/stdio-server.js"],
      "env": {
        "MCP_REPO_ROOT": "/home/patrick/fresh-schedules/fresh-root"
      }
    }
  }
}
```

Save to:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

## Available Tools

### list_files
```bash
# In Claude: "List the files in the src directory"
# Tool: list_files with path: "src"
```

### read_file
```bash
# In Claude: "Show me the package.json"
# Tool: read_file with path: "package.json"
```

### repo_info
```bash
# In Claude: "What's the Node version?"
# Tool: repo_info (no arguments)
```

## Environment Variables

| Variable | Value | Use |
|----------|-------|-----|
| `MCP_REPO_ROOT` | `/home/patrick/fresh-schedules/fresh-root` | Path to repo |
| `PORT` | `4002` | HTTP server port only |
| `MCP_TOKEN` | (optional) | HTTP auth token |

## Endpoints (HTTP Only)

```
GET http://localhost:4002/health
GET http://localhost:4002/files?path=.
GET http://localhost:4002/context?path=README.md
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `PORT=4003 pnpm --filter @packages/mcp-server start` |
| Claude not connecting | Rebuild: `pnpm --filter @packages/mcp-server build` |
| Path not found | Check `MCP_REPO_ROOT` is set correctly |
| Auth needed (HTTP) | Set `MCP_TOKEN=secret` and pass `x-mcp-token: secret` header |

## Documentation

- **Full Setup:** `docs/MCP_SERVER_SETUP.md`
- **Claude Config:** `docs/CLAUDE_DESKTOP_CONFIG.md`
- **Complete Summary:** `docs/MCP_SETUP_SUMMARY.md`

---

**Recommended: Use stdio server** (start:stdio or dev:stdio)