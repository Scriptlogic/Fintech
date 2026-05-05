const express = require('express');
const router  = express.Router();
const { getInsights } = require('../controllers/insightsController');

/**
 * GET /api/insights
 *
 * Analyzes all transactions and returns:
 *   - insights[]  plain string array  (backward-compatible)
 *   - data.insights[]  rich objects with type, icon, title, message
 *   - data.meta  summary numbers used to generate the insights
 *
 * Insight types: 'positive' | 'negative' | 'warning' | 'neutral' | 'info'
 */
router.get('/', getInsights);

module.exports = router;
