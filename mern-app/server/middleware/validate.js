/**
 * Request body validation middleware for transaction routes.
 * Runs before the controller — returns 400 with a clear errors array
 * if any field fails, so the controller only ever sees clean data.
 */

const VALID_TYPES      = ['income', 'expense'];
const VALID_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Health',
  'Entertainment', 'Education', 'Travel', 'Income', 'Other',
];

/* ─── POST /api/transactions ─────────────────────────────────────────────── */
const validateTransaction = (req, res, next) => {
  const errors = [];
  const { title, amount, type, category, date } = req.body;

  // title
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('title is required and must be a non-empty string');
  } else if (title.trim().length > 100) {
    errors.push('title cannot exceed 100 characters');
  }

  // amount
  const parsedAmount = parseFloat(amount);
  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('amount must be a number greater than 0');
  }

  // type
  if (!type) {
    errors.push('type is required');
  } else if (!VALID_TYPES.includes(type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // category
  if (!category) {
    errors.push('category is required');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // date (optional — defaults to now in the model)
  if (date && isNaN(Date.parse(date))) {
    errors.push('date must be a valid ISO date string (e.g. 2026-04-29)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Sanitise — strip unknown fields, coerce types
  req.body = {
    title:    title.trim(),
    amount:   parsedAmount,
    type,
    category,
    ...(date     && { date: new Date(date) }),
    ...(req.body.subtitle && { subtitle: String(req.body.subtitle).trim() }),
  };

  next();
};

/* ─── PUT /api/transactions/:id  (partial update — all fields optional) ─── */
const validateTransactionUpdate = (req, res, next) => {
  const errors = [];
  const { title, amount, type, category, date } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      errors.push('title must be a non-empty string');
    } else if (title.trim().length > 100) {
      errors.push('title cannot exceed 100 characters');
    }
  }

  if (amount !== undefined) {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      errors.push('amount must be a number greater than 0');
    }
  }

  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.push('date must be a valid ISO date string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Sanitise
  const clean = {};
  if (title    !== undefined) clean.title    = title.trim();
  if (amount   !== undefined) clean.amount   = parseFloat(amount);
  if (type     !== undefined) clean.type     = type;
  if (category !== undefined) clean.category = category;
  if (date     !== undefined) clean.date     = new Date(date);
  if (req.body.subtitle !== undefined) clean.subtitle = String(req.body.subtitle).trim();

  req.body = clean;
  next();
};

module.exports = { validateTransaction, validateTransactionUpdate };
