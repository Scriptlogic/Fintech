/**
 * transactionService.js
 * All API calls for transactions in one place.
 * Components never import axios directly — they use this service.
 */
import API from './axios';

/* ─── Transactions ───────────────────────────────────────────────────────── */

/**
 * Fetch all transactions.
 * @param {object} params  Optional query params: { type, category, from, to, limit, page }
 * @returns {Promise<{ data: Transaction[], total: number, count: number }>}
 */
export const fetchTransactions = async (params = {}) => {
  const res = await API.get('/transactions', { params });
  return res.data; // { success, total, count, page, pages, data }
};

/**
 * Fetch a single transaction by id.
 * @param {string} id
 */
export const fetchTransactionById = async (id) => {
  const res = await API.get(`/transactions/${id}`);
  return res.data.data;
};

/**
 * Create a new transaction.
 * @param {{ title, amount, type, category, date?, subtitle? }} payload
 */
export const createTransaction = async (payload) => {
  const res = await API.post('/transactions', payload);
  return res.data.data; // returns the created document
};

/**
 * Update a transaction.
 * @param {string} id
 * @param {object} payload  Partial transaction fields
 */
export const updateTransaction = async (id, payload) => {
  const res = await API.put(`/transactions/${id}`, payload);
  return res.data.data;
};

/**
 * Delete a single transaction.
 * @param {string} id
 */
export const deleteTransaction = async (id) => {
  const res = await API.delete(`/transactions/${id}`);
  return res.data; // { success, message, id }
};

/**
 * Bulk delete transactions.
 * @param {string[]} ids
 */
export const bulkDeleteTransactions = async (ids) => {
  const res = await API.delete('/transactions/bulk', { data: { ids } });
  return res.data;
};

/* ─── Summary ────────────────────────────────────────────────────────────── */

/**
 * Fetch aggregated summary: totalIncome, totalExpense, balance, byCategory.
 */
export const fetchSummary = async () => {
  const res = await API.get('/summary');
  return res.data;
};

/**
 * Fetch AI spending insights.
 * Returns { insights: string[], data: { insights: InsightObject[], meta } }
 */
export const fetchInsights = async () => {
  const res = await API.get('/insights');
  return res.data;
};

/**
 * Fetch month-over-month analytics.
 * Returns currentMonth, lastMonth, changes (with percent + direction), topCategories.
 */
export const fetchAnalytics = async () => {
  const res = await API.get('/analytics');
  return res.data;
};
