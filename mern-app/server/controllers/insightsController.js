/**
 * insightsController.js
 *
 * GET /api/insights
 *
 * Strategy:
 *  1. Fetch aggregated spending data from MongoDB
 *  2. Try to generate insights via Google Gemini AI
 *  3. If AI fails (no key, timeout, parse error) → fall back to rule-based engine
 *  4. Return 3–5 insights with consistent shape regardless of source
 *
 * Response shape:
 * {
 *   success: true,
 *   insights: string[],          // plain text array (backward-compatible)
 *   source: 'ai' | 'rules',      // which engine produced the insights
 *   data: {
 *     insights: InsightObject[],
 *     meta: { ... }
 *   }
 * }
 */

const Transaction        = require('../models/Transaction');
const { generateAIInsights } = require('../services/aiService');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n ?? 0);

const pctChange = (curr, prev) => {
  if (prev === 0 && curr === 0) return 0;
  if (prev === 0) return 100;
  return +((Math.abs(curr - prev) / Math.abs(prev)) * 100).toFixed(1);
};

const mkInsight = (type, icon, title, message, priority, value = 0, source = 'rules') =>
  ({ type, icon, title, message, priority, value, source });

const flattenTotals = (rows) => {
  const r = { income: 0, expense: 0 };
  rows.forEach(({ _id, total }) => {
    if (_id === 'income')  r.income  = total;
    if (_id === 'expense') r.expense = total;
  });
  r.balance = r.income - r.expense;
  return r;
};

/* ─── Rule-based engine ──────────────────────────────────────────────────── */
/**
 * Generates 3–5 deterministic insights from aggregated data.
 * Used as fallback when AI is unavailable.
 */
const buildRuleInsights = ({ cur, lst, curCategories, recentCategories, curLabel, lstLabel }) => {
  const totalCurExpense = curCategories.reduce((s, r) => s + r.total, 0);
  const topCategory     = curCategories[0] ?? null;
  const savingsRate     = cur.income > 0
    ? +((cur.balance / cur.income) * 100).toFixed(1)
    : 0;

  const candidates = [];

  // R1 — Overspend warning
  if (cur.income > 0 && cur.expense > cur.income) {
    const over = cur.expense - cur.income;
    candidates.push(mkInsight(
      'warning', '🚨', 'Spending more than you earn',
      `You are spending more than you earn — overspent by ${formatINR(over)} this month.`,
      1, over
    ));
  }

  // R6 — No income recorded
  if (cur.income === 0 && cur.expense > 0) {
    candidates.push(mkInsight(
      'warning', '⚠️', 'No income recorded',
      `You have ${formatINR(cur.expense)} in expenses but no income logged this month.`,
      1, cur.expense
    ));
  }

  // R2 — Good savings
  if (cur.income > 0 && savingsRate >= 20) {
    candidates.push(mkInsight(
      'positive', '🌟', 'Saving well this month',
      `Great job! You are saving ${savingsRate}% of your income — ${formatINR(cur.balance)} saved.`,
      2, savingsRate
    ));
  }

  // R3 — Frequent category
  const frequentCats = recentCategories.filter(r => r.count >= 4);
  if (frequentCats.length > 0) {
    const top = frequentCats[0];
    candidates.push(mkInsight(
      'info', '🔁', `Frequent ${top._id} spending`,
      `You frequently spend on ${top._id} — ${top.count} transactions in the last 30 days.`,
      3, top.count
    ));
  }

  // R4 — Top category
  if (topCategory && totalCurExpense > 0) {
    const share = +((topCategory.total / totalCurExpense) * 100).toFixed(1);
    candidates.push(mkInsight(
      'info', '📊', `Most spent on ${topCategory._id}`,
      `You spent most on ${topCategory._id} — ${formatINR(topCategory.total)} (${share}% of expenses).`,
      4, topCategory.total
    ));
  }

  // R5 — Monthly comparison
  if (lst.expense > 0 && cur.expense > 0) {
    const change = pctChange(cur.expense, lst.expense);
    if (cur.expense > lst.expense) {
      candidates.push(mkInsight(
        'negative', '📈', 'Spending up this month',
        `Your spending increased by ${change}% from ${lstLabel} (${formatINR(lst.expense)} → ${formatINR(cur.expense)}).`,
        5, change
      ));
    } else if (cur.expense < lst.expense) {
      candidates.push(mkInsight(
        'positive', '📉', 'Spending down this month',
        `Nice! Spending dropped by ${change}% from ${lstLabel} (${formatINR(lst.expense)} → ${formatINR(cur.expense)}).`,
        5, change
      ));
    }
  }

  // R7 — Low savings rate
  if (cur.income > 0 && savingsRate > 0 && savingsRate < 10) {
    candidates.push(mkInsight(
      'warning', '💡', 'Low savings rate',
      `You're saving only ${savingsRate}% of income. Aim for at least 20% to build a safety net.`,
      6, savingsRate
    ));
  }

  // Sort, deduplicate, cap
  candidates.sort((a, b) => a.priority - b.priority);
  const seen    = new Set();
  const deduped = candidates.filter(c => {
    const key = `${c.type}-${c.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let selected = deduped.slice(0, 5);

  if (selected.length === 0) {
    selected = [mkInsight(
      'neutral', '📋', 'No insights yet',
      'Add transactions to see personalised spending insights here.',
      99, 0
    )];
  }

  return selected;
};

/* ═══════════════════════════════════════════════════════════════════════════
   GET /api/insights
   ═══════════════════════════════════════════════════════════════════════════ */
const getInsights = asyncHandler(async (req, res) => {
  const now = new Date();

  /* ── Date boundaries ── */
  const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const lstStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lstEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const last30   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const curLabel = curStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const lstLabel = lstStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  /* ── Parallel DB queries ── */
  const [curTotals, lstTotals, curCategories, recentCategories] = await Promise.all([
    Transaction.aggregate([
      { $match: { date: { $gte: curStart, $lte: curEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { date: { $gte: lstStart, $lte: lstEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { date: { $gte: curStart, $lte: curEnd }, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { date: { $gte: last30 }, type: 'expense' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  /* ── Derived values ── */
  const cur = flattenTotals(curTotals);
  const lst = flattenTotals(lstTotals);
  const savingsRate = cur.income > 0
    ? +((cur.balance / cur.income) * 100).toFixed(1)
    : 0;
  const frequentCategory = recentCategories.find(r => r.count >= 4) ?? null;

  /* ── Spending summary passed to AI ── */
  const spendingData = {
    curLabel, lstLabel,
    curIncome:  cur.income,
    curExpense: cur.expense,
    curBalance: cur.balance,
    savingsRate,
    lstIncome:  lst.income,
    lstExpense: lst.expense,
    topCategories:    curCategories,
    frequentCategory,
  };

  /* ── Try AI first, fall back to rules ── */
  let selected;
  let source;

  const aiInsights = await generateAIInsights(spendingData);

  if (aiInsights && aiInsights.length > 0) {
    selected = aiInsights;
    source   = 'ai';
  } else {
    selected = buildRuleInsights({
      cur, lst, curCategories, recentCategories, curLabel, lstLabel,
    });
    source = 'rules';
  }

  /* ── Build response ── */
  const insightStrings = selected.map(i => i.message);

  res.json({
    success: true,
    source,                    // 'ai' or 'rules' — useful for debugging
    insights: insightStrings,  // plain string array (backward-compatible)
    data: {
      insights: selected,
      meta: {
        currentMonth:  curLabel,
        lastMonth:     lstLabel,
        totalIncome:   cur.income,
        totalExpense:  cur.expense,
        savings:       cur.balance,
        savingsRate,
        topCategory:   curCategories[0]?._id ?? null,
        insightCount:  selected.length,
        generatedAt:   new Date().toISOString(),
        aiPowered:     source === 'ai',
      },
    },
  });
});

module.exports = { getInsights };
