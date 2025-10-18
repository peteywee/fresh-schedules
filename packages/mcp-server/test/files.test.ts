/**
 * Integration tests for the MCP server file system endpoints.
 * These tests verify that the server can safely access files within the repository.
 */
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Create a test server with the files and context endpoints
function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const originalRepoRoot = process.env.MCP_REPO_ROOT;
  const originalToken = process.env.MCP_TOKEN;

  function getRepoRoot() {
    const envRoot = process.env.MCP_REPO_ROOT;
    if (envRoot) return path.resolve(envRoot);
    return path.resolve(__dirname, '..', '..', '..');
  }

  function checkAuth(req: express.Request, res: express.Response): boolean {
    const token = process.env.MCP_TOKEN;
    if (!token) return true;
    const header = String(req.headers['x-mcp-token'] || '');
    if (header === token) return true;
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }

  // Files endpoint - same implementation as src/index.ts
  app.get('/files', (req, res) => {
    if (!checkAuth(req, res)) return;
    const repoRoot = getRepoRoot();
    const rel = String(req.query.path || '.');
    const target = path.resolve(repoRoot, rel);

    if (!target.startsWith(repoRoot)) {
      return res.status(400).json({ error: 'path must be inside repo' });
    }

    try {
      const stat = fs.statSync(target);
      if (!stat.isDirectory()) {
        return res.json({ path: rel, type: 'file' });
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

  // Context endpoint - same implementation as src/index.ts
  app.get('/context', async (req, res) => {
    if (!checkAuth(req, res)) return;
    const repoRoot = getRepoRoot();
    const rel = String(req.query.path || '');
    const target = path.resolve(repoRoot, rel);

    if (!target.startsWith(repoRoot)) {
      return res.status(400).json({ error: 'path must be inside repo' });
    }

    try {
      const content = await fs.promises.readFile(target, 'utf-8');
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.send(content);
    } catch (err: any) {
      res.status(404).json({ error: 'not found', detail: String(err.message) });
    }
  });

  return {
    app,
    cleanup: () => {
      if (originalRepoRoot !== undefined) {
        process.env.MCP_REPO_ROOT = originalRepoRoot;
      } else {
        delete process.env.MCP_REPO_ROOT;
      }
      if (originalToken !== undefined) {
        process.env.MCP_TOKEN = originalToken;
      } else {
        delete process.env.MCP_TOKEN;
      }
    },
  };
}

describe('files endpoint', () => {
  let app: express.Application;
  let cleanup: () => void;
  let repoRoot: string;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    cleanup = testApp.cleanup;
    repoRoot = path.resolve(__dirname, '..', '..', '..');
  });

  afterEach(() => {
    cleanup();
  });

  it('can read package.json from repo root', () => {
    const pkg = path.join(repoRoot, 'package.json');
    const exists = fs.existsSync(pkg);
    expect(exists).toBe(true);
  });

  it('lists files in the repo root directory', async () => {
    const res = await request(app).get('/files').query({ path: '.' });
    expect(res.status).toBe(200);
    expect(res.body.path).toBe('.');
    expect(res.body.items).toBeInstanceOf(Array);
    expect(res.body.items.length).toBeGreaterThan(0);
    
    // Check that package.json is in the list
    const packageJson = res.body.items.find((item: any) => item.name === 'package.json');
    expect(packageJson).toBeDefined();
    expect(packageJson.isDirectory).toBe(false);
  });

  it('lists files in a subdirectory', async () => {
    const res = await request(app).get('/files').query({ path: 'packages/mcp-server' });
    expect(res.status).toBe(200);
    expect(res.body.items).toBeInstanceOf(Array);
    
    // Should contain package.json
    const packageJson = res.body.items.find((item: any) => item.name === 'package.json');
    expect(packageJson).toBeDefined();
  });

  it('returns file type when path points to a file', async () => {
    const res = await request(app).get('/files').query({ path: 'package.json' });
    expect(res.status).toBe(200);
    expect(res.body.path).toBe('package.json');
    expect(res.body.type).toBe('file');
  });

  it('rejects paths outside the repository', async () => {
    const res = await request(app).get('/files').query({ path: '../../../etc/passwd' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('path must be inside repo');
  });

  it('returns 500 for non-existent paths', async () => {
    const res = await request(app).get('/files').query({ path: 'non-existent-directory' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('requires authentication when MCP_TOKEN is set', async () => {
    process.env.MCP_TOKEN = 'test-secret-token';
    const testApp = createTestApp();

    // Request without token should fail
    const resNoToken = await request(testApp.app).get('/files').query({ path: '.' });
    expect(resNoToken.status).toBe(401);

    // Request with correct token should succeed
    const resCorrectToken = await request(testApp.app)
      .get('/files')
      .query({ path: '.' })
      .set('x-mcp-token', 'test-secret-token');
    expect(resCorrectToken.status).toBe(200);

    testApp.cleanup();
  });
});

describe('context endpoint', () => {
  let app: express.Application;
  let cleanup: () => void;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    cleanup = testApp.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  it('reads the content of package.json', async () => {
    const res = await request(app).get('/context').query({ path: 'package.json' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain('fresh-schedules');
    expect(res.text).toContain('"name":');
  });

  it('reads the content of README.md', async () => {
    const res = await request(app).get('/context').query({ path: 'README.md' });
    expect(res.status).toBe(200);
    expect(res.text.length).toBeGreaterThan(0);
  });

  it('rejects paths outside the repository', async () => {
    const res = await request(app).get('/context').query({ path: '../../../etc/passwd' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('path must be inside repo');
  });

  it('returns 404 for non-existent files', async () => {
    const res = await request(app).get('/context').query({ path: 'non-existent-file.txt' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not found');
  });

  it('requires authentication when MCP_TOKEN is set', async () => {
    process.env.MCP_TOKEN = 'test-secret-token';
    const testApp = createTestApp();

    // Request without token should fail
    const resNoToken = await request(testApp.app).get('/context').query({ path: 'package.json' });
    expect(resNoToken.status).toBe(401);

    // Request with correct token should succeed
    const resCorrectToken = await request(testApp.app)
      .get('/context')
      .query({ path: 'package.json' })
      .set('x-mcp-token', 'test-secret-token');
    expect(resCorrectToken.status).toBe(200);

    testApp.cleanup();
  });
});
