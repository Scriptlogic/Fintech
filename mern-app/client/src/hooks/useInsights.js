/**
 * useInsights
 *
 * Dedicated hook for /api/insights.
 * Owns its own loading, error, and data state — completely independent
 * from useTransactions so insights can be refreshed without re-fetching
 * the entire transaction list.
 *
 * Features:
 *  - Fetches on mount automatically
 *  - Exposes `refresh()` for manual re-fetch (e.g. after adding a transaction)
 *  - Tracks loading, error, and last-fetched timestamp
 *  - Graceful offline fallback — shows empty state, not a crash
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchInsights } from '../api/transactionService';
import { useTransactionEvent } from '../context/TransactionEventContext';

/* ─── Default / empty state ─────────────────────────────────────────────── */
const DEFAULT_STATE = {
  // Plain string array — backward-compatible with the API spec
  insights: [],
  // Rich structured data used by SpendingInsights component
  data: {
    insights: [],
    meta: {
      currentMonth:  '',
      lastMonth:     '',
      totalIncome:   0,
      totalExpense:  0,
      savings:       0,
      savingsRate:   0,
      topCategory:   null,
      insightCount:  0,
      generatedAt:   null,
    },
  },
};

const useInsights = () => {
  const { mutationCount } = useTransactionEvent();
  const [insightsData,  setInsightsData]  = useState(DEFAULT_STATE);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [lastFetched,   setLastFetched]   = useState(null);
  const [retryCount,    setRetryCount]    = useState(0);
  const [source,        setSource]        = useState('rules'); // 'ai' | 'rules'

  // Prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* ── Core fetch function ── */
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const raw = await fetchInsights();

      if (!mountedRef.current) return;

      // Validate response shape before storing
      const insights     = Array.isArray(raw.insights) ? raw.insights : [];
      const richInsights = Array.isArray(raw.data?.insights) ? raw.data.insights : [];
      const meta         = raw.data?.meta ?? DEFAULT_STATE.data.meta;

      setInsightsData({
        insights,
        data: { insights: richInsights, meta },
      });
      setLastFetched(new Date());
      setRetryCount(0);
      // Store the source so the UI can show "AI" vs "Smart Rules" badge
      setSource(raw.source ?? 'rules');
    } catch (err) {
      if (!mountedRef.current) return;

      // Distinguish network errors from server errors
      const isNetworkError = !err.response;
      const message = isNetworkError
        ? 'Could not reach the server. Check your connection.'
        : err.message || 'Failed to load insights.';

      setError(message);
      // Keep stale data visible — don't reset to DEFAULT_STATE on error
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /* ── Fetch on mount ── */
  useEffect(() => {
    load();
  }, [load]);

  /* ── Re-fetch silently whenever a transaction is added or deleted ── */
  useEffect(() => {
    // mutationCount starts at 0 — skip the initial render (no mutation yet)
    if (mutationCount === 0) return;
    load({ silent: true });
  }, [mutationCount, load]);

  /* ── Manual refresh (exposed to components) ── */
  const refresh = useCallback(() => load(), [load]);

  /* ── Silent background refresh (no spinner) ── */
  const silentRefresh = useCallback(() => load({ silent: true }), [load]);

  /* ── Retry after error ── */
  const retry = useCallback(() => {
    setRetryCount(c => c + 1);
    load();
  }, [load]);

  return {
    insightsData,
    loading,
    error,
    lastFetched,
    retryCount,
    source,
    refresh,
    silentRefresh,
    retry,
    richInsights: insightsData.data.insights,
    meta:         insightsData.data.meta,
    plainStrings: insightsData.insights,
    hasData:      insightsData.data.insights.length > 0,
    isAIPowered:  source === 'ai',
  };
};

export default useInsights;
