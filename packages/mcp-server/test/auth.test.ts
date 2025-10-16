import request from 'supertest';
import express from 'express';

/**
 * Test suite for MCP server authentication.
 * Tests the token-based auth mechanism with x-mcp-token header.
 */
describe('MCP server authentication', () => {
  describe('when MCP_TOKEN is not set', () => {
    let app: express.Application;

    beforeEach(() => {
      // Clear any MCP_TOKEN from environment
      delete process.env.MCP_TOKEN;
      
      // Create test app mimicking the auth middleware
      app = express();
      app.use(express.json());
      
      app.get('/test', (req, res) => {
        const token = process.env.MCP_TOKEN;
        if (!token) {
          return res.json({ ok: true, auth: 'not-enforced' });
        }
        const header = String(req.headers['x-mcp-token'] || '');
        if (header === token) {
          return res.json({ ok: true, auth: 'valid' });
        }
        return res.status(401).json({ error: 'unauthorized' });
      });
    });

    it('allows requests without auth header', async () => {
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.body.auth).toBe('not-enforced');
    });

    it('allows requests with any auth header', async () => {
      const res = await request(app)
        .get('/test')
        .set('x-mcp-token', 'any-token');
      expect(res.status).toBe(200);
      expect(res.body.auth).toBe('not-enforced');
    });
  });

  describe('when MCP_TOKEN is set', () => {
    let app: express.Application;
    const validToken = 'test-secret-token-123';

    beforeEach(() => {
      // Set MCP_TOKEN in environment
      process.env.MCP_TOKEN = validToken;
      
      // Create test app mimicking the auth middleware
      app = express();
      app.use(express.json());
      
      app.get('/test', (req, res) => {
        const token = process.env.MCP_TOKEN;
        if (!token) {
          return res.json({ ok: true, auth: 'not-enforced' });
        }
        const header = String(req.headers['x-mcp-token'] || '');
        if (header === token) {
          return res.json({ ok: true, auth: 'valid' });
        }
        return res.status(401).json({ error: 'unauthorized' });
      });
    });

    afterEach(() => {
      // Clean up
      delete process.env.MCP_TOKEN;
    });

    it('rejects requests without auth header', async () => {
      const res = await request(app).get('/test');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });

    it('rejects requests with invalid auth header', async () => {
      const res = await request(app)
        .get('/test')
        .set('x-mcp-token', 'wrong-token');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });

    it('allows requests with valid auth header', async () => {
      const res = await request(app)
        .get('/test')
        .set('x-mcp-token', validToken);
      expect(res.status).toBe(200);
      expect(res.body.auth).toBe('valid');
    });

    it('treats empty string token as invalid', async () => {
      const res = await request(app)
        .get('/test')
        .set('x-mcp-token', '');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });
  });
});
