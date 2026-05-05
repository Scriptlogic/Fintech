import { motion, AnimatePresence } from 'framer-motion';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n ?? 0);

const CATEGORY_COLORS = {
  Food:          { bar: 'bg-orange-400',  text: 'text-orange-300',  icon: '🍽️' },
  Transport:     { bar: 'bg-sky-400',     text: 'text-sky-300',     icon: '🚗' },
  Shopping:      { bar: 'bg-pink-400',    text: 'text-pink-300',    icon: '🛍️' },
  Bills:         { bar: 'bg-yellow-400',  text: 'text-yellow-300',  icon: '📋' },
  Health:        { bar: 'bg-teal-400',    text: 'text-teal-300',    icon: '💊' },
  Entertainment: { bar: 'bg-purple-400',  text: 'text-purple-300',  icon: '🎬' },
  Education:     { bar: 'bg-blue-400',    text: 'text-blue-300',    icon: '📚' },
  Travel:        { bar: 'bg-indigo-400',  text: 'text-indigo-300',  icon: '✈️' },
  Income:        { bar: 'bg-emerald-400', text: 'text-emerald-300', icon: '💰' },
  Other:         { bar: 'bg-slate-400',   text: 'text-slate-300',   icon: '📦' },
};

/* ─── Change pill ────────────────────────────────────────────────────────── */
const ChangePill = ({ percent, direction, type }) => {
  // For expenses: up = bad (red), down = good (green)
  // For income/balance: up = good (green), down = bad (red)
  const isExpense = type === 'expense';
  const isUp      = direction === 'up';
  const isDown    = direction === 'down';
  const isNeutral = direction === 'neutral';

  const isGood = isExpense ? isDown : isUp;
  const isBad  = isExpense ? isUp   : isDown;

  const cls = isNeutral
    ? 'bg-white/10 text-white/40 border-white/10'
    : isGood
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/20';

  return (
    <motion.span
      key={`${percent}-${direction}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}
    >
      {!isNeutral && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d={isUp ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
        </svg>
      )}
      {isNeutral ? 'No change' : `${isUp ? '+' : '−'}${percent}%`}
    </motion.span>
  );
};

/* ─── Comparison row ─────────────────────────────────────────────────────── */
const CompareRow = ({ label, icon, current, previous, change, type, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="flex items-center gap-4 py-3.5 border-b border-white/[0.05] last:border-0"
  >
    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white/80">{label}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-white/30">Prev: {formatINR(previous)}</span>
        <span className="text-white/15">·</span>
        <span className="text-xs text-white/30">Now: {formatINR(current)}</span>
      </div>
    </div>
    <ChangePill percent={change.percent} direction={change.direction} type={type} />
  </motion.div>
);

/* ─── Category bar ───────────────────────────────────────────────────────── */
const CategoryBar = ({ category, total, percentOfTotal, index }) => {
  const cfg = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
          <span>{cfg.icon}</span>
          {category}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${cfg.text}`}>{percentOfTotal}%</span>
          <span className="text-[10px] text-white/30">{formatINR(total)}</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentOfTotal}%` }}
          transition={{ duration: 0.6, delay: index * 0.06 + 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${cfg.bar}`}
        />
      </div>
    </motion.div>
  );
};

/* ─── Skeleton loader ────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse flex flex-col gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-14 rounded-xl bg-white/5" />
    ))}
  </div>
);

/* ─── Main AnalyticsPanel ────────────────────────────────────────────────── */
const AnalyticsPanel = ({ analytics, loading }) => {
  const { currentMonth, lastMonth, changes, topCategories } = analytics;

  const rows = [
    {
      label:    'Income',
      icon:     '💰',
      type:     'income',
      current:  currentMonth.income,
      previous: lastMonth.income,
      change:   changes.income,
    },
    {
      label:    'Expenses',
      icon:     '💸',
      type:     'expense',
      current:  currentMonth.expense,
      previous: lastMonth.expense,
      change:   changes.expense,
    },
    {
      label:    'Net Balance',
      icon:     '🏦',
      type:     'balance',
      current:  currentMonth.balance,
      previous: lastMonth.balance,
      change:   changes.balance,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-fuchsia-400 to-violet-500" />
          <h2 className="text-base font-bold text-white/90 tracking-tight">Analytics</h2>
          <span className="text-[10px] font-semibold text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Month over Month
          </span>
        </div>
        {currentMonth.label && (
          <span className="text-xs text-white/25 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            {currentMonth.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Left: Month comparison ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
              vs {lastMonth.label || 'Last Month'}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-white/25">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white/20 inline-block" />
                Last
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                Current
              </span>
            </div>
          </div>

          {loading ? <Skeleton /> : (
            <div>
              {rows.map((row, i) => (
                <CompareRow key={row.label} {...row} index={i} />
              ))}
            </div>
          )}

          {/* Transaction count comparison */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between"
            >
              <span className="text-[11px] text-white/30">Transactions this month</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/25">{lastMonth.transactionCount} last</span>
                <span className="text-white/15">→</span>
                <span className="text-[11px] font-bold text-white/60">{currentMonth.transactionCount} now</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: Top spending categories ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
            Top Spending — {currentMonth.label || 'This Month'}
          </p>

          {loading ? <Skeleton /> : topCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-2xl opacity-30">📊</span>
              <p className="text-xs text-white/25">No expense data for this month</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {topCategories.map((cat, i) => (
                <CategoryBar
                  key={cat.category}
                  category={cat.category}
                  total={cat.total}
                  percentOfTotal={cat.percentOfTotal}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default AnalyticsPanel;
