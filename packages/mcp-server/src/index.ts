/**
 * @fileoverview A simple express server to provide file system access to a repository.
 * It's designed to be a local helper service for development tools.
 * It exposes endpoints to list files and read file contents.
 * Access can be restricted by a token.
 */
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;

/**
 * Resolves the repository root directory.
 * It first checks for the `MCP_REPO_ROOT` environment variable.
 * If not found, it defaults to three levels up from the current script's directory.
 * @returns {string} The absolute path to the repository root.
 */
function getRepoRoot() {
  const envRoot = process.env.MCP_REPO_ROOT;
  if (envRoot) return path.resolve(envRoot);
  return path.resolve(__dirname, "..", "..", "..");
}

/**
 * Checks for authorization based on a token.
 * If the `MCP_TOKEN` environment variable is set, it requires the request
 * to have a matching `x-mcp-token` header.
 * If auth fails, it sends a 401 response.
 * @param {express.Request} req - The express request object.
 * @param {express.Response} res - The express response object.
 * @returns {boolean} `true` if the request is authorized, `false` otherwise.
 */
function checkAuth(req: express.Request, res: express.Response): boolean {
  const token = process.env.MCP_TOKEN;
  if (!token) return true; // auth not enforced
  const header = String(req.headers['x-mcp-token'] || '');
  if (header === token) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}

/**
 * @api {get} /health Health Check
 * @apiName GetHealth
 * @apiGroup Server
 * @apiDescription Provides a simple health check endpoint.
 * Also returns the process ID of the server.
 * @apiSuccess {Boolean} ok Indicates if the server is running.
 * @apiSuccess {Number} pid The process ID of the server.
 */
app.get("/health", (req, res) => {
  if (!checkAuth(req, res)) return;
  res.json({ ok: true, pid: process.pid });
});

/**
 * @api {get} /files List Files
 * @apiName GetFiles
 * @apiGroup FileSystem
 * @apiDescription Lists files and directories under a given path relative to the repository root.
 * The path is specified via the `path` query parameter.
 * @apiParam {String} [path="."] The path relative to the repository root to list files from.
 * @apiSuccess {String} path The requested path.
 * @apiSuccess {Object[]} items An array of file and directory objects.
 * @apiSuccess {String} items.name The name of the file or directory.
 * @apiSuccess {String} items.path The relative path from the repo root.
 * @apiSuccess {Boolean} items.isDirectory True if the item is a directory.
 * @apiError {String} error Description of the error.
 */
app.get("/files", (req, res) => {
  if (!checkAuth(req, res)) return;
  const repoRoot = getRepoRoot();
  const rel = String(req.query.path || ".");
  const target = path.resolve(repoRoot, rel);

  if (!target.startsWith(repoRoot)) {
    return res.status(400).json({ error: "path must be inside repo" });
  }

  try {
    const stat = fs.statSync(target);
    if (!stat.isDirectory()) {
      return res.json({ path: rel, type: "file" });
    }
    const items = fs.readdirSync(target).map((name) => {
      const p = path.join(target, name);
      const s = fs.statSync(p);
      return { name, path: path.relative(repoRoot, p), isDirectory: s.isDirectory() };
    });
    res.json({ path: rel, items });
  } catch (err: any) {
    res.status(500).json({ error: String(err.message) });
  }
});

/**
 * @api {get} /context Get File Content
 * @apiName GetContext
 * @apiGroup FileSystem
 * @apiDescription Returns the content of a specified file.
 * The path is specified via the `path` query parameter and must be inside the repository.
 * @apiParam {String} path The path to the file relative to the repository root.
 * @apiSuccess {String} content The content of the file.
 * @apiError {String} error Description of the error (e.g., "path must be inside repo", "not found").
 */
app.get("/context", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const repoRoot = getRepoRoot();
  const rel = String(req.query.path || "");
  const target = path.resolve(repoRoot, rel);

  if (!target.startsWith(repoRoot)) {
    return res.status(400).json({ error: "path must be inside repo" });
  }

  try {
    const content = await fs.promises.readFile(target, "utf-8");
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.send(content);
  } catch (err: any) {
    res.status(404).json({ error: "not found", detail: String(err.message) });
  }
});

/**
 * Starts the MCP server.
 * Listens on the port specified by the `PORT` environment variable, or 4002 by default.
 */
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP server listening on http://localhost:${PORT}`);
  if (process.env.MCP_REPO_ROOT) {
    // eslint-disable-next-line no-console
    console.log(`Using MCP_REPO_ROOT=${process.env.MCP_REPO_ROOT}`);
  }
});
