import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '../../utils/format';
import useInsights from '../../hooks/useInsights';

/* ─────────────────────────────────────────────────────────────────────────────
   ICON MAP
   Maps insight type → the three required icons:
     💡  general / info / positive / neutral
     📈  growth / negative (spending up)
     ⚠️  warning
   The backend also sends its own icon per insight — we use that as the
   primary icon and fall back to the type-based one.
───────────────────────────────────────────────────────────────────────────── */
const TYPE_ICON = {
  positive: '💡',
  negative: '📈',
  warning:  '⚠️',
  info:     '💡',
  neutral:  '💡',
};

/* ─────────────────────────────────────────────────────────────────────────────
   CARD THEME — glassmorphism palette per insight type
───────────────────────────────────────────────────────────────────────────── */
const THEME = {
  positive: {
    outerBorder:  'border-emerald-500/20',
    glass:        'bg-emerald-500/[0.06]',
    glow:         'shadow-emerald-500/10',
    topBar:       'from-emerald-400 to-teal-500',
    iconRing:     'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    badge:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/25',
    badgeLabel:   'Good',
    accentBar:    'bg-emerald-400',
    titleColor:   'text-emerald-100',
    hoverBorder:  'hover:border-emerald-500/40',
    hoverGlow:    'hover:shadow-emerald-500/20',
  },
  negative: {
    outerBorder:  'border-rose-500/20',
    glass:        'bg-rose-500/[0.06]',
    glow:         'shadow-rose-500/10',
    topBar:       'from-rose-400 to-pink-500',
    iconRing:     'bg-rose-500/20 border-rose-500/30 text-rose-300',
    badge:        'bg-rose-500/20 text-rose-300 border-rose-500/25',
    badgeLabel:   'Alert',
    accentBar:    'bg-rose-400',
    titleColor:   'text-rose-100',
    hoverBorder:  'hover:border-rose-500/40',
    hoverGlow:    'hover:shadow-rose-500/20',
  },
  warning: {
    outerBorder:  'border-amber-500/25',
    glass:        'bg-amber-500/[0.06]',
    glow:         'shadow-amber-500/10',
    topBar:       'from-amber-400 to-orange-500',
    iconRing:     'bg-amber-500/20 border-amber-500/30 text-amber-300',
    badge:        'bg-amber-500/20 text-amber-300 border-amber-500/25',
    badgeLabel:   'Warning',
    accentBar:    'bg-amber-400',
    titleColor:   'text-amber-100',
    hoverBorder:  'hover:border-amber-500/40',
    hoverGlow:    'hover:shadow-amber-500/20',
  },
  info: {
    outerBorder:  'border-blue-500/20',
    glass:        'bg-blue-500/[0.05]',
    glow:         'shadow-blue-500/8',
    topBar:       'from-blue-400 to-indigo-500',
    iconRing:     'bg-blue-500/20 border-blue-500/30 text-blue-300',
    badge:        'bg-blue-500/20 text-blue-300 border-blue-500/20',
    badgeLabel:   'Info',
    accentBar:    'bg-blue-400',
    titleColor:   'text-blue-100',
    hoverBorder:  'hover:border-blue-500/40',
    hoverGlow:    'hover:shadow-blue-500/15',
  },
  neutral: {
    outerBorder:  'border-white/10',
    glass:        'bg-white/[0.03]',
    glow:         'shadow-black/10',
    topBar:       'from-slate-400 to-slate-500',
    iconRing:     'bg-white/10 border-white/15 text-white/50',
    badge:        'bg-white/10 text-white/40 border-white/10',
    badgeLabel:   'Note',
    accentBar:    'bg-white/30',
    titleColor:   'text-white/80',
    hoverBorder:  'hover:border-white/20',
    hoverGlow:    'hover:shadow-white/5',
  },
};

const getTheme = (type) => THEME[type] ?? THEME.neutral;

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON — shimmer placeholder while loading
───────────────────────────────────────────────────────────────────────────── */
const InsightCardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.07 }}
    className="relative rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
  >
    {/* Shimmer sweep */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: index * 0.2 }}
    />
    <div className="p-5 flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/8 shrink-0" />
      <div className="flex-1 flex flex-col gap-2.5 justify-center">
        <div className="h-4 w-2/5 rounded-lg bg-white/8" />
        <div className="h-3 w-full rounded-lg bg-white/5" />
        <div className="h-3 w-3/4 rounded-lg bg-white/5" />
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   INSIGHT CARD — individual glassmorphism card per insight
───────────────────────────────────────────────────────────────────────────── */
const InsightCard = ({ insight, index }) => {
  const theme = getTheme(insight.type);
  // Use backend icon if provided, otherwise fall back to type-based icon
  const displayIcon = insight.icon || TYPE_ICON[insight.type] || '💡';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{   opacity: 0, x: -16, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.38, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      className={`
        group relative rounded-2xl overflow-hidden
        border ${theme.outerBorder} ${theme.hoverBorder}
        ${theme.glass} backdrop-blur-xl
        shadow-xl ${theme.glow} ${theme.hoverGlow}
        transition-all duration-300 cursor-default
      `}
    >
      {/* ── Coloured top bar (3px) ── */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${theme.topBar}`} />

      {/* ── Left accent bar ── */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${theme.accentBar} opacity-60`} />

      {/* ── Hover glow overlay ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-white/[0.02] pointer-events-none rounded-2xl"
      />

      {/* ── Background orb ── */}
      <motion.div
        initial={{ scale: 1, opacity: 0.08 }}
        whileHover={{ scale: 1.4, opacity: 0.15 }}
        transition={{ duration: 0.4 }}
        className={`absolute -bottom-6 -right-6 w-28 h-28 rounded-full blur-2xl pointer-events-none ${theme.accentBar}`}
      />

      {/* ── Card body ── */}
      <div className="relative px-5 py-4 flex gap-4">

        {/* Icon bubble */}
        <motion.div
          whileHover={{ scale: 1.15, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            shrink-0 border ${theme.iconRing} shadow-inner
          `}
        >
          {displayIcon}
        </motion.div>

        {/* Text content */}
        <div className="flex-1 min-w-0 pt-0.5">

          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className={`text-sm font-bold leading-snug ${theme.titleColor}`}>
              {insight.title}
            </p>
            {/* Type badge */}
            <span className={`
              shrink-0 inline-flex items-center gap-1
              text-[9px] font-bold uppercase tracking-widest
              px-2 py-0.5 rounded-full border ${theme.badge}
            `}>
              {/* Dot */}
              <span className={`w-1 h-1 rounded-full ${theme.accentBar}`} />
              {theme.badgeLabel}
            </span>
          </div>

          {/* Message */}
          <p className="text-xs text-white/55 leading-relaxed">
            {insight.message}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   META STRIP — 4 summary cells above the cards
───────────────────────────────────────────────────────────────────────────── */
const MetaStrip = ({ meta }) => {
  if (!meta?.currentMonth) return null;

  const savingsOk   = (meta.savings ?? 0) >= 0;
  const rate        = meta.savingsRate ?? 0;
  const rateColor   = rate >= 20 ? 'text-emerald-400' : rate >= 10 ? 'text-amber-400' : 'text-rose-400';
  const rateIcon    = rate >= 20 ? '🌟' : rate >= 10 ? '📊' : '⚠️';

  const cells = [
    { icon: '💰', label: 'Income',    value: formatINR(meta.totalIncome),  color: 'text-emerald-400' },
    { icon: '💸', label: 'Expenses',  value: formatINR(meta.totalExpense), color: 'text-rose-400'    },
    {
      icon:  savingsOk ? '🏦' : '📉',
      label: 'Saved',
      value: `${savingsOk ? '' : '−'}${formatINR(Math.abs(meta.savings ?? 0))}`,
      color: savingsOk ? 'text-blue-300' : 'text-rose-400',
    },
    { icon: rateIcon, label: 'Save Rate', value: `${rate}%`, color: rateColor },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6"
    >
      {cells.map(({ icon, label, value, color }) => (
        <motion.div
          key={label}
          whileHover={{ y: -2, scale: 1.02 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-xl px-3 py-3 text-center cursor-default"
        >
          <p className="text-lg mb-0.5 leading-none">{icon}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-1 mb-0.5">{label}</p>
          <p className={`text-sm font-bold leading-tight ${color}`}>{value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ERROR STATE
───────────────────────────────────────────────────────────────────────────── */
const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 gap-4 text-center"
  >
    <motion.div
      animate={{ rotate: [0, -8, 8, -8, 0] }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-3xl"
    >
      ⚠️
    </motion.div>
    <div>
      <p className="text-sm font-bold text-rose-300">Failed to load insights</p>
      <p className="text-xs text-white/30 mt-1.5 max-w-xs leading-relaxed">{message}</p>
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 text-rose-300 text-xs font-bold transition-all"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Try Again
    </motion.button>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────────────────── */
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="flex flex-col items-center justify-center py-14 gap-3 text-center"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="text-4xl opacity-25"
    >
      💡
    </motion.div>
    <p className="text-sm font-semibold text-white/35">No insights yet</p>
    <p className="text-xs text-white/20 max-w-xs leading-relaxed">
      Add income and expense transactions to start seeing personalised AI spending insights.
    </p>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────────── */
const SectionHeader = ({ count, loading, error, refreshing, onRefresh, isAIPowered }) => (
  <div className="flex items-center justify-between mb-6">
    {/* Left */}
    <div className="flex items-center gap-3 flex-wrap">
      {/* Accent bar */}
      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500 shrink-0" />

      <div>
        <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
          AI Spending Insights
        </h2>
        <p className="text-xs text-white/35 mt-0.5">
          Smart analysis of your spending patterns
        </p>
      </div>

      {/* Source badge — changes based on whether AI or rules generated the insights */}
      {isAIPowered ? (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-violet-300 bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block"
          />
          Gemini AI
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-300 bg-blue-500/15 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
          Smart Rules
        </span>
      )}
    </div>

    {/* Right */}
    <div className="flex items-center gap-2 shrink-0">
      {/* Count chip */}
      {!loading && !error && count > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-white/30 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
        >
          {count} insight{count !== 1 ? 's' : ''}
        </motion.span>
      )}

      {/* Refresh button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRefresh}
        disabled={loading || refreshing}
        title="Refresh insights"
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/30 hover:text-violet-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <motion.svg
          animate={{ rotate: refreshing ? 360 : 0 }}
          transition={{ duration: 0.7, ease: 'linear', repeat: refreshing ? Infinity : 0 }}
          className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </motion.svg>
      </motion.button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   Self-contained — calls useInsights directly, no props needed from parent.
───────────────────────────────────────────────────────────────────────────── */
const SpendingInsights = () => {
  const {
    richInsights,
    meta,
    loading,
    error,
    lastFetched,
    refresh,
    retry,
    isAIPowered,
  } = useInsights();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8"
      aria-label="AI Spending Insights"
    >
      {/* Section header */}
      <SectionHeader
        count={richInsights.length}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        isAIPowered={isAIPowered}
      />

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map(i => <InsightCardSkeleton key={i} index={i} />)}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] backdrop-blur-xl overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-rose-400 to-pink-500" />
          <ErrorState message={error} onRetry={retry} />
        </div>
      )}

      {/* ── Data ── */}
      {!loading && !error && (
        <>
          {/* Meta strip */}
          <MetaStrip meta={meta} />

          {/* Cards grid — stacked on mobile, 1 col always (cards are wide) */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {richInsights.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
                >
                  <div className="h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
                  <EmptyState />
                </motion.div>
              ) : (
                richInsights.map((ins, i) => (
                  <InsightCard
                    key={`${ins.type}-${ins.title}-${i}`}
                    insight={ins}
                    index={i}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {lastFetched && richInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-white/20">
                  {isAIPowered ? 'Gemini AI · refreshes after each transaction' : 'Smart Rules · refreshes after each transaction'}
                </span>
              </div>
              <span className="text-[10px] text-white/15">
                {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {meta?.currentMonth ? ` · ${meta.currentMonth}` : ''}
              </span>
            </motion.div>
          )}
        </>
      )}
    </motion.section>
  );
};

export default SpendingInsights;
