const Transaction = require('../models/Transaction');

/**
 * asyncHandler — eliminates try/catch boilerplate.
 * Forwards any thrown error to Express error middleware.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ═══════════════════════════════════════════════════════════════════════════
   GET /api/transactions
   Returns all transactions, newest first.

   Query params (all optional):
     ?type=income|expense
     ?category=Food
     ?from=YYYY-MM-DD
     ?to=YYYY-MM-DD
     ?limit=N          (default 100, max 500)
     ?page=N           (default 1, for pagination)
   ═══════════════════════════════════════════════════════════════════════════ */
const getTransactions = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    from,
    to,
    limit = 100,
    page  = 1,
  } = req.query;

  // Build filter
  const filter = {};
  if (type)     filter.type     = type;
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) {
      // Include the full "to" day (set time to end of day)
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filter.date.$lte = toDate;
    }
  }

  const safeLimit = Math.min(Number(limit), 500);
  const skip      = (Number(page) - 1) * safeLimit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(safeLimit),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    count:   transactions.length,
    page:    Number(page),
    pages:   Math.ceil(total / safeLimit),
    data:    transactions,
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   GET /api/transactions/summary   (also exposed as GET /api/summary)
   Aggregates totals: totalIncome, totalExpense, balance.
   Also returns a per-category breakdown.
   ═══════════════════════════════════════════════════════════════════════════ */
const getSummary = asyncHandler(async (req, res) => {
  // Run both aggregations in parallel
  const [typeTotals, categoryBreakdown, recentCount] = await Promise.all([
    // 1. Group by type → income / expense totals
    Transaction.aggregate([
      {
        $group: {
          _id:   '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // 2. Group by category → per-category spend
    Transaction.aggregate([
      {
        $group: {
          _id:   '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          type:  { $first: '$type' },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // 3. Count transactions in the last 7 days
    Transaction.countDocuments({
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  // Flatten type totals
  const totals = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
  typeTotals.forEach(({ _id, total, count }) => {
    if (_id === 'income')  { totals.income  = total; totals.incomeCount  = count; }
    if (_id === 'expense') { totals.expense = total; totals.expenseCount = count; }
  });

  res.json({
    success:      true,
    // ── Core numbers ──────────────────────────────────────────────────────
    totalIncome:  totals.income,
    totalExpense: totals.expense,
    balance:      totals.income - totals.expense,
    // ── Counts ────────────────────────────────────────────────────────────
    transactionCount: totals.incomeCount + totals.expenseCount,
    incomeCount:      totals.incomeCount,
    expenseCount:     totals.expenseCount,
    last7DaysCount:   recentCount,
    // ── Breakdown ─────────────────────────────────────────────────────────
    byCategory: categoryBreakdown.map(({ _id, total, count }) => ({
      category: _id,
      total,
      count,
    })),
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   GET /api/transactions/:id
   ═══════════════════════════════════════════════════════════════════════════ */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: `Transaction not found with id: ${req.params.id}`,
    });
  }

  res.json({ success: true, data: transaction });
});

/* ═══════════════════════════════════════════════════════════════════════════
   POST /api/transactions
   Body (validated by middleware/validate.js before reaching here):
     { title, amount, type, category, date?, subtitle? }
   ═══════════════════════════════════════════════════════════════════════════ */
const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Transaction created',
    data:    transaction,
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   PUT /api/transactions/:id
   ═══════════════════════════════════════════════════════════════════════════ */
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: `Transaction not found with id: ${req.params.id}`,
    });
  }

  res.json({ success: true, message: 'Transaction updated', data: transaction });
});

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE /api/transactions/:id
   ═══════════════════════════════════════════════════════════════════════════ */
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: `Transaction not found with id: ${req.params.id}`,
    });
  }

  res.json({
    success: true,
    message: 'Transaction deleted',
    id:      req.params.id,
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE /api/transactions/bulk
   Body: { ids: ['id1', 'id2', ...] }
   ═══════════════════════════════════════════════════════════════════════════ */
const deleteMany = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provide a non-empty array of transaction ids in body.ids',
    });
  }

  const result = await Transaction.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `${result.deletedCount} transaction(s) deleted`,
    deleted: result.deletedCount,
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   GET /api/analytics
   Compares current month vs last month for income, expense, and balance.

   Response shape:
   {
     currentMonth:  { label, income, expense, balance, transactionCount }
     lastMonth:     { label, income, expense, balance, transactionCount }
     changes: {
       income:  { amount, percent, direction }   direction: 'up'|'down'|'neutral'
       expense: { amount, percent, direction }
       balance: { amount, percent, direction }
     }
     topCategories: [{ category, total, count, percentOfTotal }]  // current month
   }
   ═══════════════════════════════════════════════════════════════════════════ */
const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();

  /* ── Date boundaries ── */
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  /* ── Month label helper ── */
  const monthLabel = (d) =>
    d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  /* ── Aggregation helper: totals by type for a date range ── */
  const getTotals = async (start, end) => {
    const rows = await Transaction.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:   '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    const result = { income: 0, expense: 0, count: 0 };
    rows.forEach(({ _id, total, count }) => {
      if (_id === 'income')  { result.income  = total; result.count += count; }
      if (_id === 'expense') { result.expense = total; result.count += count; }
    });
    result.balance = result.income - result.expense;
    return result;
  };

  /* ── Category breakdown for current month ── */
  const getCategoryBreakdown = async (start, end) => {
    const rows = await Transaction.aggregate([
      { $match: { date: { $gte: start, $lte: end }, type: 'expense' } },
      {
        $group: {
          _id:   '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    return rows.map(({ _id, total, count }) => ({
      category:       _id,
      total,
      count,
      percentOfTotal: grandTotal > 0 ? +((total / grandTotal) * 100).toFixed(1) : 0,
    }));
  };

  /* ── Percent change helper ── */
  const pctChange = (current, previous) => {
    if (previous === 0 && current === 0) return { amount: 0, percent: 0, direction: 'neutral' };
    if (previous === 0) return { amount: current, percent: 100, direction: 'up' };
    const diff    = current - previous;
    const percent = +((Math.abs(diff) / Math.abs(previous)) * 100).toFixed(1);
    return {
      amount:    +diff.toFixed(2),
      percent,
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
    };
  };

  /* ── Run all queries in parallel ── */
  const [current, last, topCategories] = await Promise.all([
    getTotals(currentStart, currentEnd),
    getTotals(lastStart, lastEnd),
    getCategoryBreakdown(currentStart, currentEnd),
  ]);

  res.json({
    success: true,
    currentMonth: {
      label:            monthLabel(currentStart),
      income:           current.income,
      expense:          current.expense,
      balance:          current.balance,
      transactionCount: current.count,
    },
    lastMonth: {
      label:            monthLabel(lastStart),
      income:           last.income,
      expense:          last.expense,
      balance:          last.balance,
      transactionCount: last.count,
    },
    changes: {
      income:  pctChange(current.income,  last.income),
      expense: pctChange(current.expense, last.expense),
      balance: pctChange(current.balance, last.balance),
    },
    topCategories,
  });
});

module.exports = {
  getTransactions,
  getSummary,
  getAnalytics,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMany,
};
