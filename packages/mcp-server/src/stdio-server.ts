#!/usr/bin/env node
/**
 * MCP Server (stdio-based)
 * 
 * This is a modern Model Context Protocol server that communicates
 * via stdin/stdout. It provides tools and resources for AI assistants
 * to interact with the Fresh Schedules repository.
 */

import fs from "fs";
import path from "path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    TextContent,
    Tool,
    Resource,
    ResourceContents,
} from "@modelcontextprotocol/sdk/types.js";

const repoRoot = process.env.MCP_REPO_ROOT || path.resolve(__dirname, "..", "..", "..");

interface FileListItem {
    name: string;
    path: string;
    isDirectory: boolean;
}

interface FileReadResult {
    path: string;
    content: string;
}

// Helper: safely resolve paths within repo
function resolvePath(rel: string): string {
    const target = path.resolve(repoRoot, rel);
    if (!target.startsWith(repoRoot)) {
        throw new Error("Path must be inside repository root");
    }
    return target;
}

// Helper: list directory contents
function listDirectory(rel: string): FileListItem[] {
    const target = resolvePath(rel);
    const stat = fs.statSync(target);

    if (!stat.isDirectory()) {
        return [];
    }

    return fs.readdirSync(target).map((name) => {
        const p = path.join(target, name);
        const s = fs.statSync(p);
        return {
            name,
            path: path.relative(repoRoot, p),
            isDirectory: s.isDirectory(),
        };
    });
}

// Helper: read file content
function readFile(rel: string): FileReadResult {
    const target = resolvePath(rel);
    const content = fs.readFileSync(target, "utf-8");
    return {
        path: path.relative(repoRoot, target),
        content,
    };
}

// Initialize server
const server = new Server(
    {
        name: "fresh-schedules-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
        {
            name: "list_files",
            description:
                "List files and directories in a path relative to repository root",
            inputSchema: {
                type: "object" as const,
                properties: {
                    path: {
                        type: "string",
                        description: 'Path relative to repo root (default: ".")',
                    },
                },
                required: [],
            },
        },
        {
            name: "read_file",
            description: "Read the contents of a file in the repository",
            inputSchema: {
                type: "object" as const,
                properties: {
                    path: {
                        type: "string",
                        description: "Path to file relative to repo root",
                    },
                },
                required: ["path"],
            },
        },
        {
            name: "repo_info",
            description: "Get information about the repository root and structure",
            inputSchema: {
                type: "object" as const,
                properties: {},
                required: [],
            },
        },
    ];
    return { tools };
});

// List available resources (files/folders in repo)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    try {
        const items = listDirectory(".");
        const resources: Resource[] = items.map((item) => ({
            uri: `file://${path.join(repoRoot, item.path)}`,
            name: item.name,
            description: item.isDirectory ? "Directory" : "File",
            mimeType: item.isDirectory ? "application/vnd.directory" : "text/plain",
        }));
        return { resources };
    } catch (err) {
        return { resources: [] };
    }
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    try {
        const uri = request.params.uri;
        if (!uri.startsWith("file://")) {
            throw new Error("Invalid URI scheme");
        }

        const filePath = fileURLToPath(uri);
        const rel = path.relative(repoRoot, filePath);
        const result = readFile(rel);

        const contents: ResourceContents[] = [
            {
                uri: request.params.uri,
                mimeType: "text/plain",
                text: result.content,
            },
        ];
        return { contents };
    } catch (err: any) {
        throw new Error(`Failed to read resource: ${err.message}`);
    }
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (name === "list_files") {
            const dirPath = (args as { path?: string }).path || ".";
            const items = listDirectory(dirPath);
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(items, null, 2),
                    },
                ],
            };
        }

        if (name === "read_file") {
            const filePath = (args as { path: string }).path;
            const result = readFile(filePath);
            return {
                content: [
                    {
                        type: "text" as const,
                        text: result.content,
                    },
                ],
            };
        }

        if (name === "repo_info") {
            const info = {
                repoRoot,
                nodeVersion: process.version,
                platform: process.platform,
                uptime: process.uptime(),
            };
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(info, null, 2),
                    },
                ],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (err: any) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error: ${err.message}`,
                },
            ],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Fresh Schedules MCP server running (PID: ${process.pid})`);
}

main().catch((err) => {
    console.error("MCP server error:", err);
    process.exit(1);
});