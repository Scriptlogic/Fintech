/**
 * useTransactions
 *
 * Central state hook for the dashboard.
 * Owns: transactions list, summary totals, loading/error states.
 * Exposes: load, add, remove actions.
 *
 * All data comes exclusively from the backend API.
 * When the backend is unreachable, shows empty state — no dummy/mock data.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchTransactions,
  fetchSummary,
  fetchAnalytics,
  createTransaction,
  deleteTransaction,
} from '../api/transactionService';
import { useToast } from '../components/ui/Toast';
import { useTransactionEvent } from '../context/TransactionEventContext';

/* ─── Default summary (shown while loading or on error) ─────────────────── */
const DEFAULT_SUMMARY = {
  totalIncome:  0,
  totalExpense: 0,
  balance:      0,
  byCategory:   [],
};

/* ─── Default analytics (shown while loading or offline) ────────────────── */
const DEFAULT_ANALYTICS = {
  currentMonth: { label: '', income: 0, expense: 0, balance: 0, transactionCount: 0 },
  lastMonth:    { label: '', income: 0, expense: 0, balance: 0, transactionCount: 0 },
  changes: {
    income:  { amount: 0, percent: 0, direction: 'neutral' },
    expense: { amount: 0, percent: 0, direction: 'neutral' },
    balance: { amount: 0, percent: 0, direction: 'neutral' },
  },
  topCategories: [],
};

/* ─── Normalise a raw API document to the shape the UI expects ───────────── */
const normalise = (doc) => ({
  id:       doc._id  || doc.id,
  _id:      doc._id  || doc.id,
  title:    doc.title,
  subtitle: doc.subtitle || doc.category,
  amount:   doc.amount,
  type:     doc.type,
  category: doc.category,
  // Ensure date is always a plain YYYY-MM-DD string for grouping
  date:     doc.date
    ? new Date(doc.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
});

const useTransactions = () => {
  const toast = useToast();
  const { notifyMutation } = useTransactionEvent();
  const [transactions,    setTransactions]    = useState([]);
  const [summary,         setSummary]         = useState(DEFAULT_SUMMARY);
  const [analytics,       setAnalytics]       = useState(DEFAULT_ANALYTICS);
  const [loading,         setLoading]         = useState(true);
  const [summaryLoading,  setSummaryLoading]  = useState(true);
  const [analyticsLoading,setAnalyticsLoading]= useState(true);
  const [error,           setError]           = useState(null);
  const [isOffline,       setIsOffline]       = useState(false);

  /* ── Fetch transactions from API ── */
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTransactions({ limit: 200 });
      const normalised = (res.data || []).map(normalise);
      setTransactions(normalised);
      setIsOffline(false);
    } catch (err) {
      // Backend unreachable — show empty state, no dummy data
      console.warn('[useTransactions] API unavailable:', err.message);
      setTransactions([]);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch summary from API ── */
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await fetchSummary();
      setSummary({
        totalIncome:  data.totalIncome  ?? 0,
        totalExpense: data.totalExpense ?? 0,
        balance:      data.balance      ?? 0,
        byCategory:   data.byCategory   ?? [],
      });
    } catch (err) {
      console.warn('[useTransactions] Summary API unavailable, computing locally');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  /* ── Fetch analytics from API ── */
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await fetchAnalytics();
      setAnalytics({
        currentMonth:  data.currentMonth  ?? DEFAULT_ANALYTICS.currentMonth,
        lastMonth:     data.lastMonth     ?? DEFAULT_ANALYTICS.lastMonth,
        changes:       data.changes       ?? DEFAULT_ANALYTICS.changes,
        topCategories: data.topCategories ?? [],
      });
    } catch (err) {
      console.warn('[useTransactions] Analytics API unavailable:', err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  /* ── Compute summary locally when API is offline ── */
  useEffect(() => {
    if (!isOffline) return;
    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    setSummary({ totalIncome, totalExpense, balance: totalIncome - totalExpense, byCategory: [] });
  }, [isOffline, transactions]);

  /* ── Initial load ── */
  useEffect(() => {
    loadTransactions();
    loadSummary();
    loadAnalytics();
  }, [loadTransactions, loadSummary, loadAnalytics]);

  /* ── Add a transaction ── */
  const addTransaction = useCallback(async (formData) => {
    // Optimistic: build a temp entry immediately
    const tempId = `temp-${Date.now()}`;
    const today  = new Date().toISOString().split('T')[0];
    const optimistic = normalise({
      _id:      tempId,
      title:    formData.title || formData.description,
      subtitle: formData.subtitle || formData.category,
      amount:   parseFloat(formData.amount),
      type:     formData.type,
      category: formData.category,
      date:     formData.date || today,
    });

    // Show immediately
    setTransactions(prev => [optimistic, ...prev]);

    // Update summary optimistically
    setSummary(prev => {
      const delta = parseFloat(formData.amount);
      const newIncome  = formData.type === 'income'  ? prev.totalIncome  + delta : prev.totalIncome;
      const newExpense = formData.type === 'expense' ? prev.totalExpense + delta : prev.totalExpense;
      return { ...prev, totalIncome: newIncome, totalExpense: newExpense, balance: newIncome - newExpense };
    });

    if (isOffline) return optimistic; // skip API call when offline

    try {
      const payload = {
        title:    formData.title || formData.description,
        subtitle: formData.subtitle || formData.category || '',
        amount:   parseFloat(formData.amount),
        type:     formData.type,
        category: formData.category,
        date:     formData.date || today,
      };
      const created = await createTransaction(payload);
      const real    = normalise(created);

      // Replace temp entry with real one from DB
      setTransactions(prev => prev.map(t => t.id === tempId ? real : t));
      // Refresh summary + analytics from server
      loadSummary();
      loadAnalytics();
      // Signal all subscribers (e.g. useInsights) that data changed
      notifyMutation();
      toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added — ${real.title}`);
      return real;
    } catch (err) {
      // Roll back optimistic update
      setTransactions(prev => prev.filter(t => t.id !== tempId));
      setSummary(prev => {
        const delta = parseFloat(formData.amount);
        const newIncome  = formData.type === 'income'  ? prev.totalIncome  - delta : prev.totalIncome;
        const newExpense = formData.type === 'expense' ? prev.totalExpense - delta : prev.totalExpense;
        return { ...prev, totalIncome: newIncome, totalExpense: newExpense, balance: newIncome - newExpense };
      });
      toast.error(err.message || 'Failed to save transaction');
      throw err;
    }
  }, [isOffline, loadSummary]);

  /* ── Delete a transaction ── */
  const removeTransaction = useCallback(async (id) => {
    const removed = transactions.find(t => t.id === id || t._id === id);
    if (!removed) return;

    // Optimistic remove
    setTransactions(prev => prev.filter(t => t.id !== id && t._id !== id));
    setSummary(prev => {
      const delta = removed.amount;
      const newIncome  = removed.type === 'income'  ? prev.totalIncome  - delta : prev.totalIncome;
      const newExpense = removed.type === 'expense' ? prev.totalExpense - delta : prev.totalExpense;
      return { ...prev, totalIncome: newIncome, totalExpense: newExpense, balance: newIncome - newExpense };
    });

    if (isOffline) return;

    try {
      await deleteTransaction(id);
      loadSummary();
      loadAnalytics();
      // Signal all subscribers (e.g. useInsights) that data changed
      notifyMutation();
      toast.success('Transaction deleted');
    } catch (err) {
      // Roll back
      setTransactions(prev => [removed, ...prev]);
      setSummary(prev => {
        const delta = removed.amount;
        const newIncome  = removed.type === 'income'  ? prev.totalIncome  + delta : prev.totalIncome;
        const newExpense = removed.type === 'expense' ? prev.totalExpense + delta : prev.totalExpense;
        return { ...prev, totalIncome: newIncome, totalExpense: newExpense, balance: newIncome - newExpense };
      });
      toast.error('Failed to delete transaction');
      throw err;
    }
  }, [transactions, isOffline, loadSummary]);

  /* ── Refresh everything ── */
  const refresh = useCallback(() => {
    loadTransactions();
    loadSummary();
    loadAnalytics();
  }, [loadTransactions, loadSummary, loadAnalytics]);

  return {
    transactions,
    summary,
    analytics,
    loading,
    summaryLoading,
    analyticsLoading,
    error,
    isOffline,
    addTransaction,
    removeTransaction,
    refresh,
  };
};

export default useTransactions;
