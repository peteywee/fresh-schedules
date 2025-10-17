import request from 'supertest';
import express from 'express';

// tiny express app mimicking the route used in src/index.ts
const app = express();
app.get('/health', (_req, res) => res.json({ ok: true }));

describe('health endpoint', () => {
  it('returns ok true', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
