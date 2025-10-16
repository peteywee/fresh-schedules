import express from "express";
import cors from "cors";
import pino from "pino";
import { createShiftRouter } from "./routes/shifts";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();

// Middleware for consistent error handling, logging, and CORS
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  log.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming request');
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  log.error({ err, method: req.method, url: req.url }, 'Error occurred');
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "scheduler-api" }));
app.get("/status", (_req, res) => res.status(200).json({ ok: true, env: process.env.NODE_ENV || "dev", time: new Date().toISOString() }));
app.get("/__/probe", (req, res) => res.status(200).json({ ok: true, runId: req.header("x-run-id") || null, probedAt: new Date().toISOString() }));

app.use("/api/shifts", createShiftRouter());

const PORT = Number(process.env.PORT || 3333);
app.listen(PORT, () => log.info({ port: PORT }, "scheduler-api listening"));
