const express  = require('express');
const router   = express.Router();

const {
  getTransactions,
  getSummary,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMany,
} = require('../controllers/transactionController');

const {
  validateTransaction,
  validateTransactionUpdate,
} = require('../middleware/validate');

/*
 * IMPORTANT — route order matters in Express.
 * Static segments (/summary, /bulk) must be declared BEFORE /:id
 * so Express doesn't try to cast "summary" or "bulk" as a Mongo ObjectId.
 */

// ── Summary (aggregation) ────────────────────────────────────────────────────
// GET /api/transactions/summary
router.get('/summary', getSummary);

// ── Bulk delete ──────────────────────────────────────────────────────────────
// DELETE /api/transactions/bulk   body: { ids: [...] }
router.delete('/bulk', deleteMany);

// ── Collection ───────────────────────────────────────────────────────────────
// GET  /api/transactions           ?type ?category ?from ?to ?limit ?page
// POST /api/transactions           body: { title, amount, type, category, date?, subtitle? }
router
  .route('/')
  .get(getTransactions)
  .post(validateTransaction, createTransaction);

// ── Single document ──────────────────────────────────────────────────────────
// GET    /api/transactions/:id
// PUT    /api/transactions/:id     body: partial transaction fields
// DELETE /api/transactions/:id
router
  .route('/:id')
  .get(getTransactionById)
  .put(validateTransactionUpdate, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
