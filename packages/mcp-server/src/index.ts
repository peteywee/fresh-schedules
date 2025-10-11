import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, pid: process.pid });
});

// List files under a directory (relative to repository root)
app.get("/files", async (req, res) => {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const rel = String(req.query.path || ".");
  const target = path.resolve(repoRoot, rel);

  if (!target.startsWith(repoRoot)) {
    return res.status(400).json({ error: "path must be inside repo" });
  }

  try {
    const stat = await fs.promises.stat(target);
    if (!stat.isDirectory()) {
      return res.json({ path: rel, type: "file" });
    }
    const files = await fs.promises.readdir(target);
    const items = await Promise.all(files.map(async (name) => {
      const p = path.join(target, name);
      const s = await fs.promises.stat(p);
      return { name, path: path.relative(repoRoot, p), isDirectory: s.isDirectory() };
    }));
    res.json({ path: rel, items });
  } catch (err: any) {
    res.status(500).json({ error: String(err.message) });
  }
});

// Return file contents for a path inside the repo
app.get("/context", (req, res) => {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const rel = String(req.query.path || "");
  const target = path.resolve(repoRoot, rel);

  if (!target.startsWith(repoRoot)) {
    return res.status(400).json({ error: "path must be inside repo" });
  }

  try {
    const content = fs.readFileSync(target, "utf-8");
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.send(content);
  } catch (err: any) {
    res.status(404).json({ error: "not found", detail: String(err.message) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP server listening on http://localhost:${PORT}`);
});
