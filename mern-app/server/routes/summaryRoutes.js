const express = require('express');
const router  = express.Router();
const { getSummary } = require('../controllers/transactionController');

/**
 * GET /api/summary
 * Returns: totalIncome, totalExpense, balance, counts, byCategory breakdown.
 * This is the same handler as GET /api/transactions/summary —
 * exposed here as a clean top-level endpoint for the dashboard.
 */
router.get('/', getSummary);

module.exports = router;
