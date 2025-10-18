import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;

// Helper: resolve repo root from env or default to three levels up
function getRepoRoot() {
  const envRoot = process.env.MCP_REPO_ROOT;
  if (envRoot) return path.resolve(envRoot);
  return path.resolve(__dirname, "..", "..", "..");
}

// Simple token auth: if MCP_TOKEN is set, require header 'x-mcp-token' to match
function checkAuth(req: express.Request, res: express.Response) {
  const token = process.env.MCP_TOKEN;
  if (!token) return true; // auth not enforced
  const header = String(req.headers['x-mcp-token'] || '');
  if (header === token) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}

// Health check
app.get("/health", (req, res) => {
  if (!checkAuth(req, res)) return;
  res.json({ ok: true, pid: process.pid });
});

// List files under a directory (relative to repository root)
app.get("/files", (req, res) => {
  if (!checkAuth(req, res)) return;
  const repoRoot = process.env.MCP_REPO_ROOT || path.resolve(__dirname, "..", "..", "..");
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

// Return file contents for a path inside the repo
app.get("/context", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const repoRoot = process.env.MCP_REPO_ROOT || path.resolve(__dirname, "..", "..", "..");
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP server listening on http://localhost:${PORT}`);
  if (process.env.MCP_REPO_ROOT) {
    console.log(`Using MCP_REPO_ROOT=${process.env.MCP_REPO_ROOT}`);
  }
});
