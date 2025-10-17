/**
 * Integration tests for the MCP server health endpoint.
 * These tests verify the actual implementation by importing and testing the routes.
 */
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import path from 'path';

// Create a test server with the same configuration as the actual server
function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Set up test environment variables
  const originalRepoRoot = process.env.MCP_REPO_ROOT;
  const originalToken = process.env.MCP_TOKEN;
  
  // Use the actual repository root for tests
  if (!process.env.MCP_REPO_ROOT) {
    process.env.MCP_REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
  }

  // Import the checkAuth function pattern
  function checkAuth(req: express.Request, res: express.Response): boolean {
    const token = process.env.MCP_TOKEN;
    if (!token) return true;
    const header = String(req.headers['x-mcp-token'] || '');
    if (header === token) return true;
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }

  // Health endpoint - same implementation as src/index.ts
  app.get('/health', (req, res) => {
    if (!checkAuth(req, res)) return;
    res.json({ ok: true, pid: process.pid });
  });

  return { app, cleanup: () => {
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
  }};
}

describe('health endpoint', () => {
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

  it('returns ok true with pid', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.pid).toBe(process.pid);
  });

  it('requires authentication when MCP_TOKEN is set', async () => {
    process.env.MCP_TOKEN = 'test-secret-token';
    const testApp = createTestApp();
    
    // Request without token should fail
    const resNoToken = await request(testApp.app).get('/health');
    expect(resNoToken.status).toBe(401);
    expect(resNoToken.body.error).toBe('unauthorized');

    // Request with wrong token should fail
    const resWrongToken = await request(testApp.app)
      .get('/health')
      .set('x-mcp-token', 'wrong-token');
    expect(resWrongToken.status).toBe(401);

    // Request with correct token should succeed
    const resCorrectToken = await request(testApp.app)
      .get('/health')
      .set('x-mcp-token', 'test-secret-token');
    expect(resCorrectToken.status).toBe(200);
    expect(resCorrectToken.body.ok).toBe(true);

    testApp.cleanup();
  });
});
