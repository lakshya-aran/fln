// Explicitly load .env from the backend directory. The dev wrapper
// script runs `npm run dev --workspace @fln/backend` from the repo root,
// so dotenv's default cwd lookup misses backend/.env and the backend
// silently falls back to the local file DB. This ensures the Atlas
// connection string is loaded regardless of how the script is started.
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dotenv_dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dotenv_dir, '..', '.env') });

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { dbStore, connectDB, UserRole, User, Student, School, Question, Worksheet, LevelWorksheet, AnswerSubmission, EvaluationReport, Ticket, LogEntry, Intervention, BestPractice, CYCLE_NAMES } from './db';
import { renderPaper } from './renderer/paper-renderer';
import type { TemplateData } from './templates/base';
import { generateAIDiagnostic, evaluateAIDiagnostic, generateAIPersonalizedWorksheet, evaluateAIWorksheet } from './gemini';
import { generateDiagnosticPaper } from './paperGenerator';
import { generateQuestionsForLevel } from './levelGenerator';
import * as levelsBackendClient from './levelsBackendClient';
import { STATES_UTS } from './geoData';
import { getAuthUser, canAccessStudent, sanitizeUser, JWT_SECRET, JWT_EXPIRES_IN, SEED_DEMO_PASSWORD_HASH } from './auth';
import { registerAnnouncementRoutes } from './routes/announcements';
import { registerStatsRoutes } from './routes/stats';
import { registerAuthRoutes } from './routes/auth';
import { registerTicketRoutes } from './routes/tickets';
import { registerLogbookRoutes } from './routes/logbook';
import { registerGeoRoutes } from './routes/geo';
import { registerClassRoutes } from './routes/classes';
import { registerAdminRoutes } from './routes/admin';
import { registerTeacherRoutes } from './routes/teachers';
import { registerSchoolRoutes } from './routes/schools';
import { registerInterventionRoutes } from './routes/interventions';
import { registerBestPracticeRoutes } from './routes/bestPractices';
import { registerStudentRoutes } from './routes/students';
import { registerWorksheetRoutes } from './routes/worksheets';
import { registerEvaluationRoutes } from './routes/evaluation';
import { registerAnalyticsRoutes } from './routes/analytics';
import { registerDiagnosticBulkRoutes } from './routes/diagnosticBulk';
import { randomUUID } from 'crypto';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ROOT_DIR, PYTHON_BIN, AI_SERVICES_DIR } from './config';

// Safety net: the MongoDB driver occasionally rejects a connection AFTER
// connectDB() has returned (the client class keeps background pools
// alive). In ESM, an unhandled promise rejection exits the process by
// default. Swallow these so a transient Atlas outage doesn't kill the
// ICR/Ollama server, which can keep serving from the local file DB
// until the driver recovers.
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled promise rejection (likely MongoDB driver):', reason);
});
process.on('uncaughtException', (err) => {
  console.warn('Uncaught exception (likely MongoDB driver):', err);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


/**
 * Cookie-based auth fallback for the preview-html route only. The frontend's
 * session cookie (`token`) carries the same JWT the Bearer header carries,
 * so this just unwraps the cookie value and re-uses the JWT verify path.
 *
 * Returns the authenticated User on success, null on missing/invalid cookie.
 */
function readUserFromCookie(req: express.Request): User | null {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  const raw = match ? match[1] : '';
  if (!raw) return null;
  let payload: { email?: string };
  try {
    payload = jwt.verify(raw, JWT_SECRET) as { email?: string };
  } catch {
    return null;
  }
  if (!payload?.email) return null;
  return dbStore.getUserSync(payload.email);
}


async function startServer() {
  // Connect to MongoDB — connectDB() has its own internal 3-attempt
  // retry and falls back to a local file DB if all attempts fail. Wrap
  // the call in try/catch too so that any unhandledRejection from the
  // background driver doesn't exit the process.
  try {
    await connectDB();
  } catch (err: any) {
    console.warn('connectDB threw despite its fallback path: ' + (err?.message || err));
  }

  // Initialize file-based DB
  await dbStore.init();

  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Serve Puppeteer output PDF sheets statically
  app.use('/output', express.static(path.join(ROOT_DIR, 'output')));
  app.use('/worksheets', express.static(path.join(ROOT_DIR, 'public', 'worksheets')));

  // --- API Endpoints ---

registerStatsRoutes(app);

  registerAuthRoutes(app);
  registerAnnouncementRoutes(app);
  registerTicketRoutes(app);
  registerLogbookRoutes(app);

  registerAdminRoutes(app);

  registerGeoRoutes(app);

  registerTeacherRoutes(app);
  registerSchoolRoutes(app);

  // Classes
  registerClassRoutes(app);

  registerStudentRoutes(app);

  registerEvaluationRoutes(app);
  registerWorksheetRoutes(app);
  registerAnalyticsRoutes(app);
  registerDiagnosticBulkRoutes(app);

  // --- Intervention Tracking & Best Practices Repository ---

  // Create a new intervention
  registerInterventionRoutes(app);
  registerBestPracticeRoutes(app);

  // In development, serve the frontend using Vite development middleware.
  // ──────────────────────────────────────────────────────────────────
  // Paper preview (phase 1) — the new template-engine renderer.
  //
  //   GET /api/papers/:studentId/preview-html?classNumber=1&qid=L5_001&L7_001&...
  //
  // Returns a fully self-contained HTML document. Caller can pipe it
  // through html2canvas + jsPDF (browser) or Puppeteer (server) for a PDF.
  //
  // Phase 1: question data comes from query params (renderer demo).
  // Phase 2: fetch from MongoDB by studentId (paper doc + question bank).
  // ──────────────────────────────────────────────────────────────────
  app.get('/api/papers/:studentId/preview-html', async (req, res) => {
    // Phase 1 auth: prefer Authorization: Bearer (curl-friendly), fall back to
    // the browser session cookie (so a logged-in user at :5173 can click
    // the link without manually copying a token). This is intentionally
    // narrower than getAuthUser — keeps shared auth code untouched.
    const user = getAuthUser(req) || readUserFromCookie(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const classNumber = Math.max(1, Math.min(4, parseInt(String(req.query.classNumber || '1'), 10))) as 1 | 2 | 3 | 4;
    const qidsParam = String(req.query.qids || '').trim();
    const qids = qidsParam ? qidsParam.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (qids.length === 0) {
      return res.status(400).json({ error: 'qids query param required (comma-separated)' });
    }

    // Phase 1: synthesise question data from qids. Each qid encodes
    //   templateId + glyph + count, e.g. "T07_Counting:star:5"
    // Phase 2: replace with dbStore.getQuestion(qid).
    const questions: TemplateData[] = [];
    for (const qid of qids) {
      const [templateId, glyph, countStr] = qid.split(':');
      const count = parseInt(countStr || '3', 10);
      if (!templateId) {
        return res.status(400).json({ error: `malformed qid: ${qid}` });
      }
      // Only T07 is registered in phase 1.
      if (templateId !== 'T07_Counting') {
        return res.status(400).json({ error: `template ${templateId} not yet registered (phase 1 = T07 only)` });
      }
      questions.push({
        templateId,
        qid: `${templateId}-${qid}-${Date.now()}-${Math.random()}`,
        concept: 'counting',
        marks: 1,
        payload: {
          glyph: glyph || 'star',
          count,
          answer: count,
        },
      });
    }

    const { html, metrics } = renderPaper({
      meta: {
        title: 'FLN Diagnostic Paper',
        subtitle: `Class ${classNumber} — Preview`,
        studentName: req.params.studentId,
        classLabel: `Class ${classNumber}`,
        classNumber,
      },
      questions,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Paper-Metrics', JSON.stringify(metrics));
    return res.send(html);
  });

  // In production, serve the built frontend bundle (frontend/dist).
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: path.resolve(ROOT_DIR, '..', 'frontend'),
        server: { middlewareMode: true, hmr: false },
        appType: "spa"
      });
      app.use(vite.middlewares);
      console.log("[AI Studio] Vite development middleware mounted successfully");
    } catch (err) {
      console.warn("[AI Studio] Failed to load Vite dev middleware, falling back to static:", err);
    }
  } else {
    const distPath =
      process.env.FRONTEND_DIST_DIR ||
      path.resolve(ROOT_DIR, '..', 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
