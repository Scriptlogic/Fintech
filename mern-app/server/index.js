require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound     = require('./middleware/notFound');

/* ─── Connect to MongoDB ─────────────────────────────────────────────────── */
connectDB();

/* ─── App ────────────────────────────────────────────────────────────────── */
const app = express();

/* ─── Core middleware ────────────────────────────────────────────────────── */
app.use(
  cors({
    origin: [
      'http://localhost:3000',   // Vite (custom port)
      'http://localhost:5173',   // Vite default
      'http://localhost:5174',   // Vite fallback
    ],
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

/* ─── Dev request logger ─────────────────────────────────────────────────── */
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`  ${req.method.padEnd(7)} ${req.originalUrl}`);
    next();
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success:   true,
    message:   'Fintech Dashboard API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      transactions: {
        list:    'GET    /api/transactions',
        create:  'POST   /api/transactions',
        get:     'GET    /api/transactions/:id',
        update:  'PUT    /api/transactions/:id',
        delete:  'DELETE /api/transactions/:id',
        bulk:    'DELETE /api/transactions/bulk',
        summary: 'GET    /api/transactions/summary',
      },
      summary: 'GET /api/summary',
    },
  });
});

// ── Transactions (CRUD + nested summary) ─────────────────────────────────────
app.use('/api/transactions', require('./routes/transactionRoutes'));

// ── Summary (top-level shortcut) ─────────────────────────────────────────────
app.use('/api/summary', require('./routes/summaryRoutes'));

// ── Analytics (month-over-month comparison) ───────────────────────────────────
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ── AI Spending Insights ──────────────────────────────────────────────────────
app.use('/api/insights', require('./routes/insightsRoutes'));

/* ─── 404 + Error handling (must be last) ───────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

/* ─── Start server ───────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  console.log('');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│         Fintech Dashboard API — Ready           │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│  Port    ${String(PORT).padEnd(39)}│`);
  console.log(`│  Env     ${(process.env.NODE_ENV || 'development').padEnd(39)}│`);
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│  GET    ${`${base}/api/transactions`.padEnd(40)}│`);
  console.log(`│  POST   ${`${base}/api/transactions`.padEnd(40)}│`);
  console.log(`│  DELETE ${`${base}/api/transactions/:id`.padEnd(40)}│`);
  console.log(`│  GET    ${`${base}/api/summary`.padEnd(40)}│`);
  console.log(`│  GET    ${`${base}/api/transactions/summary`.padEnd(40)}│`);
  console.log(`│  GET    ${`${base}/api/analytics`.padEnd(40)}│`);
  console.log(`│  GET    ${`${base}/api/insights`.padEnd(40)}│`);
  console.log('└─────────────────────────────────────────────────┘');
  console.log('');

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running"
  });
});
});
