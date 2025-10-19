# Claude Desktop Configuration

This guide shows how to configure Claude Desktop to use the Fresh Schedules MCP server.

## Setup Instructions

### Step 1: Build the MCP Server

```bash
cd /home/patrick/fresh-schedules/fresh-root
pnpm --filter @packages/mcp-server build
```

Verify the build succeeded:
```bash
ls -la packages/mcp-server/dist/stdio-server.js
```

### Step 2: Locate Claude Desktop Config

The configuration location depends on your OS:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux (if using Snap or Flatpak):**
```bash
~/.config/claude/claude_desktop_config.json
# or
~/.var/app/com.anthropic.claude/config/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Step 3: Add Fresh Schedules MCP Server

Open the config file and add the following server entry:

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

> **Important:** Replace `/home/patrick/fresh-schedules/fresh-root` with your actual repository path.

### Step 4: Restart Claude Desktop

Close Claude Desktop completely and reopen it.

## Verification

Once Claude Desktop is running, the MCP server should be connected. You can test it by:

1. In a Claude conversation, ask: "List the files in the root of my repository"
2. Claude should use the `list_files` tool to browse the repository
3. Try: "What's in the package.json?" — Claude should read and summarize it

## Troubleshooting

### MCP Server doesn't connect

**Check the Node path:**
```bash
which node
```

Use the full path if `node` isn't in PATH:
```json
{
  "command": "/usr/local/bin/node",
  "args": ["/path/to/stdio-server.js"]
}
```

**Rebuild if needed:**
```bash
pnpm --filter @packages/mcp-server clean
pnpm --filter @packages/mcp-server install
pnpm --filter @packages/mcp-server build
```

**Check logs:**

macOS:
```bash
tail -f ~/Library/Application\ Support/Claude/logs.txt
```

Linux (Snap):
```bash
journalctl -u snapd -f
```

### File access errors

Ensure the repository path is readable:
```bash
ls -la /home/patrick/fresh-schedules/fresh-root
# Should show: drwxr-xr-x ... fresh-root
```

### Permissions issues

If you get permission denied errors:
```bash
chmod +x /home/patrick/fresh-schedules/fresh-root/packages/mcp-server/dist/stdio-server.js
```

## Advanced Configuration

### Multiple Servers

You can add multiple MCP servers to Claude:

```json
{
  "mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["/path/to/fresh-schedules/packages/mcp-server/dist/stdio-server.js"],
      "env": { "MCP_REPO_ROOT": "/path/to/fresh-schedules" }
    },
    "other-project": {
      "command": "node",
      "args": ["/path/to/other-project/mcp-server.js"],
      "env": { "REPO_ROOT": "/path/to/other-project" }
    }
  }
}
```

### Environment Variables

Pass additional environment variables to the server:

```json
{
  "env": {
    "MCP_REPO_ROOT": "/path/to/fresh-schedules",
    "NODE_ENV": "production",
    "DEBUG": "fresh-schedules:*"
  }
}
```

### Disabling Temporarily

To disable the server without removing config:

```json
{
  "fresh-schedules": {
    "disabled": true,
    "command": "node",
    "args": ["/path/to/stdio-server.js"]
  }
}
```

## Available Tools in Claude

Once connected, Claude can use these tools:

1. **list_files** — Browse repository directories
   - Claude: "Show me what's in the src directory"
   - Tool: `list_files` with `path: "src"`

2. **read_file** — Read file contents
   - Claude: "Show me the package.json"
   - Tool: `read_file` with `path: "package.json"`

3. **repo_info** — Get repository metadata
   - Claude: "What's the Node version for this project?"
   - Tool: `repo_info`

## Example Workflow

**You:**
```
Read the main README and tell me about this project
```

**Claude:** (uses `read_file` tool to read README.md)
```
This is Fresh Schedules, a compliance-first staff scheduling PWA for 
Top Shelf Service LLC. It's organized as a monorepo with Next.js web app, 
Express API service, and Firebase functions...
```

**You:**
```
What TypeScript version does this project use?
```

**Claude:** (uses `read_file` to read package.json)
```
The project uses TypeScript 5.9.3 as specified in the root package.json.
```

## Support

For issues or questions:
1. Check the main [MCP_SERVER_SETUP.md](./MCP_SERVER_SETUP.md) guide
2. Review the [error logs](#check-logs) section above
3. Ensure Node.js v18+ is installed: `node --version`
4. Rebuild the MCP server package