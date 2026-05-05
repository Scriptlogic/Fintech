const express = require('express');
const router  = express.Router();
const { getAnalytics } = require('../controllers/transactionController');

/**
 * GET /api/analytics
 * Returns current month vs last month comparison:
 *   - income, expense, balance totals for each month
 *   - percentage change with direction (up / down / neutral)
 *   - top spending categories for current month
 */
router.get('/', getAnalytics);

module.exports = router;
