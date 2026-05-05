import { useState, useMemo } from 'react';import { motion, AnimatePresence } from 'framer-motion';

/* ─── Category config ────────────────────────────────────────────────────── */
const CATEGORY_CONFIG = {
  Food: {
    icon:    '🍽️',
    bg:      'bg-orange-500/15',
    text:    'text-orange-300',
    border:  'border-orange-500/20',
    dot:     'bg-orange-400',
  },
  Transport: {
    icon:    '🚗',
    bg:      'bg-sky-500/15',
    text:    'text-sky-300',
    border:  'border-sky-500/20',
    dot:     'bg-sky-400',
  },
  Shopping: {
    icon:    '🛍️',
    bg:      'bg-pink-500/15',
    text:    'text-pink-300',
    border:  'border-pink-500/20',
    dot:     'bg-pink-400',
  },
  Bills: {
    icon:    '📋',
    bg:      'bg-yellow-500/15',
    text:    'text-yellow-300',
    border:  'border-yellow-500/20',
    dot:     'bg-yellow-400',
  },
  Health: {
    icon:    '💊',
    bg:      'bg-teal-500/15',
    text:    'text-teal-300',
    border:  'border-teal-500/20',
    dot:     'bg-teal-400',
  },
  Entertainment: {
    icon:    '🎬',
    bg:      'bg-purple-500/15',
    text:    'text-purple-300',
    border:  'border-purple-500/20',
    dot:     'bg-purple-400',
  },
  Income: {
    icon:    '💰',
    bg:      'bg-emerald-500/15',
    text:    'text-emerald-300',
    border:  'border-emerald-500/20',
    dot:     'bg-emerald-400',
  },
  Other: {
    icon:    '📦',
    bg:      'bg-slate-500/15',
    text:    'text-slate-300',
    border:  'border-slate-500/20',
    dot:     'bg-slate-400',
  },
};

const getCategory = (cat) => CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Other;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso) => {
  const d     = new Date(iso);
  const today = new Date();
  const yest  = new Date(); yest.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yest))  return 'Yesterday';

  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const groupByDate = (txns) => {
  const map = new Map();
  txns.forEach((tx) => {
    if (!map.has(tx.date)) map.set(tx.date, []);
    map.get(tx.date).push(tx);
  });
  // Sort dates descending
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
};

const filterLast7Days = (txns) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6); // today − 6 = 7-day window
  cutoff.setHours(0, 0, 0, 0);
  return txns.filter((tx) => new Date(tx.date) >= cutoff);
};

/* ─── Filter pill ────────────────────────────────────────────────────────── */
const FILTERS = ['All', 'Income', 'Expense'];

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
      ${active
        ? 'bg-white/15 text-white border border-white/20 shadow-inner'
        : 'text-white/35 hover:text-white/60 border border-transparent hover:border-white/10'}
    `}
  >
    {label}
  </button>
);

/* ─── Single transaction card ────────────────────────────────────────────── */
const TransactionCard = ({ tx, index, onDelete }) => {
  const cat      = getCategory(tx.category);
  const isIncome = tx.type === 'income';
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete?.(tx._id || tx.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0, transition: { duration: 0.22 } }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 3, transition: { duration: 0.15 } }}
      onMouseLeave={() => setConfirmDelete(false)}
      className="
        group flex items-center gap-4
        bg-white/[0.03] hover:bg-white/[0.06]
        border border-white/[0.06] hover:border-white/[0.12]
        rounded-2xl px-4 py-3.5
        transition-colors duration-200
        cursor-default
      "
    >
      {/* ── Icon bubble ── */}
      <div className={`
        w-11 h-11 rounded-xl flex items-center justify-center text-xl
        shrink-0 ${cat.bg} border ${cat.border} shadow-inner
      `}>
        {cat.icon}
      </div>

      {/* ── Title + subtitle ── */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate leading-tight">{tx.title}</p>
        <p className="text-[11px] text-white/35 mt-0.5 truncate">{tx.subtitle}</p>
      </div>

      {/* ── Category tag ── */}
      <span className={`
        hidden sm:inline-flex items-center gap-1.5
        text-[10px] font-bold tracking-wide uppercase
        px-2.5 py-1 rounded-full border
        ${cat.bg} ${cat.text} ${cat.border} shrink-0
      `}>
        <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
        {tx.category}
      </span>

      {/* ── Amount ── */}
      <div className="text-right shrink-0 min-w-[80px]">
        <p className={`text-sm font-bold leading-tight ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isIncome ? '+' : '−'}{formatINR(tx.amount)}
        </p>
        <p className="text-[10px] text-white/25 mt-0.5">{isIncome ? 'Credit' : 'Debit'}</p>
      </div>

      {/* ── Delete button ── */}
      {onDelete && (
        <motion.button
          onClick={handleDelete}
          disabled={deleting}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          className={`
            shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-all duration-150
            ${confirmDelete
              ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
              : 'bg-white/5 text-white/30 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10'}
            disabled:opacity-40
          `}
        >
          {deleting ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : confirmDelete ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

/* ─── Date group header ──────────────────────────────────────────────────── */
const DateGroupHeader = ({ dateISO, transactions }) => {
  const dayTotal = transactions.reduce((sum, tx) => {
    return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
  }, 0);
  const isNet = dayTotal >= 0;

  return (
    <div className="flex items-center justify-between mb-2 mt-1 px-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
          {formatDate(dateISO)}
        </span>
        <span className="text-[10px] text-white/20">
          · {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
        </span>
      </div>
      <span className={`text-[11px] font-semibold ${isNet ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
        {isNet ? '+' : '−'}{formatINR(Math.abs(dayTotal))}
      </span>
    </div>
  );
};

/* ─── Empty state ────────────────────────────────────────────────────────── */
const EmptyState = ({ hasFilter }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 gap-4"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl"
    >
      {hasFilter ? '🔍' : '💳'}
    </motion.div>
    <div className="text-center">
      <p className="text-sm font-semibold text-white/50">
        {hasFilter ? 'No transactions found' : 'No transactions yet'}
      </p>
      <p className="text-xs text-white/25 mt-1.5 max-w-xs leading-relaxed">
        {hasFilter
          ? 'Try a different filter to see your transactions.'
          : 'Add your first income or expense using the "Add Expense" button above.'}
      </p>
    </div>
  </motion.div>
);

/* ─── Summary strip ──────────────────────────────────────────────────────── */
const SummaryStrip = ({ transactions }) => {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { label: 'Total In',  value: income,           color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
        { label: 'Total Out', value: expense,           color: 'text-rose-400',    bg: 'bg-rose-500/10    border-rose-500/15'    },
        { label: 'Net',       value: income - expense,  color: income - expense >= 0 ? 'text-blue-300' : 'text-rose-400',
          bg: 'bg-blue-500/10 border-blue-500/15' },
      ].map(({ label, value, color, bg }) => (
        <div key={label} className={`rounded-xl border ${bg} px-3 py-2.5 text-center`}>
          <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold mb-1">{label}</p>
          <p className={`text-sm font-bold ${color}`}>
            {value >= 0 ? '' : '−'}{formatINR(Math.abs(value))}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
const RecentTransactions = ({ transactions, onDelete }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAll, setShowAll]           = useState(false);

  // Filter to last 7 days
  const last7 = useMemo(() => filterLast7Days(transactions), [transactions]);

  // Apply type filter
  const filtered = useMemo(() => {
    if (activeFilter === 'Income')  return last7.filter(t => t.type === 'income');
    if (activeFilter === 'Expense') return last7.filter(t => t.type === 'expense');
    return last7;
  }, [last7, activeFilter]);

  // Group by date
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Flatten for "show less" truncation (max 6 items)
  const MAX_VISIBLE = 6;
  const flatFiltered = filtered;
  const visibleGroups = useMemo(() => {
    if (showAll) return grouped;
    let count = 0;
    const result = [];
    for (const [date, txns] of grouped) {
      const remaining = MAX_VISIBLE - count;
      if (remaining <= 0) break;
      const slice = txns.slice(0, remaining);
      result.push([date, slice]);
      count += slice.length;
    }
    return result;
  }, [grouped, showAll]);

  const hasMore = flatFiltered.length > MAX_VISIBLE;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mt-8"
    >
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
          <h2 className="text-base font-bold text-white/90 tracking-tight">
            Recent Transactions
          </h2>
          {/* Live badge */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Last 7 days
          </span>
        </div>

        {/* Count chip */}
        <span className="text-xs text-white/30 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          {last7.length} entries
        </span>
      </div>

      {/* ── Summary strip ── */}
      <SummaryStrip transactions={last7} />

      {/* ── Filter pills ── */}
      <div className="flex items-center gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <FilterPill
            key={f}
            label={f}
            active={activeFilter === f}
            onClick={() => { setActiveFilter(f); setShowAll(false); }}
          />
        ))}
      </div>

      {/* ── Transaction groups ── */}
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {visibleGroups.length === 0 ? (
            <EmptyState key="empty" hasFilter={activeFilter !== 'All'} />
          ) : (
            visibleGroups.map(([date, txns]) => (
              <motion.div
                key={date}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Date group header */}
                <DateGroupHeader dateISO={date} transactions={txns} />

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {txns.map((tx, i) => (
                      <TransactionCard key={tx._id || tx.id} tx={tx} index={i} onDelete={onDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Show more / less ── */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-5"
        >
          <button
            onClick={() => setShowAll(v => !v)}
            className="
              inline-flex items-center gap-2
              text-xs font-semibold text-white/40 hover:text-white/70
              bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-white/20
              px-5 py-2.5 rounded-full
              transition-all duration-200
            "
          >
            {showAll ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show Less
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show All {flatFiltered.length} Transactions
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.section>
  );
};

export default RecentTransactions;
