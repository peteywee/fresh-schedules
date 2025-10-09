import express from "express";
import cors from "cors";
import pino from "pino";
import { z } from "zod";
import { createShiftInput } from "@packages/types";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "scheduler-api" }));
app.get("/status", (_req, res) => res.status(200).json({ ok: true, env: process.env.NODE_ENV || "dev", time: new Date().toISOString() }));
app.get("/__/probe", (req, res) => res.status(200).json({ ok: true, runId: req.header("x-run-id") || null, probedAt: new Date().toISOString() }));

// Minimal RBAC header stub (replace with Firebase auth in real impl)
const RoleHeader = z.enum(["admin","manager","staff"]);

app.post("/api/shifts", (req, res) => {
  const role = RoleHeader.safeParse(req.header("x-role"));
  if (!role.success || (role.data !== "admin" && role.data !== "manager")) {
    return res.status(403).json({ ok: false, error: "forbidden" });
  }
  const parsed = createShiftInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  // TODO: integrate Firestore Admin write + audit append here
  const id = `sh_${Date.now()}`;
  return res.status(201).json({ ok: true, id });
});

const PORT = Number(process.env.PORT || 3333);
app.listen(PORT, () => log.info({ port: PORT }, "scheduler-api listening"));
