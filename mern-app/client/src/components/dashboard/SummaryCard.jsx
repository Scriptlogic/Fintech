import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const IncomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

/* ─── Theme map ──────────────────────────────────────────────────────────── */
const themeMap = {
  balance: {
    icon:        <WalletIcon />,
    iconBg:      'bg-blue-500/20 text-blue-300',
    border:      'border-blue-500/20',
    glowShadow:  'shadow-blue-500/10',
    gradientTop: 'from-blue-500/30 to-transparent',
    orb:         'bg-blue-500',
    sparkColor:  '#60a5fa',
    label:       'bg-blue-500/15 text-blue-300 border-blue-500/20',
  },
  income: {
    icon:        <IncomeIcon />,
    iconBg:      'bg-emerald-500/20 text-emerald-300',
    border:      'border-emerald-500/20',
    glowShadow:  'shadow-emerald-500/10',
    gradientTop: 'from-emerald-500/30 to-transparent',
    orb:         'bg-emerald-500',
    sparkColor:  '#34d399',
    label:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  },
  expense: {
    icon:        <ExpenseIcon />,
    iconBg:      'bg-rose-500/20 text-rose-300',
    border:      'border-rose-500/20',
    glowShadow:  'shadow-rose-500/10',
    gradientTop: 'from-rose-500/30 to-transparent',
    orb:         'bg-rose-500',
    sparkColor:  '#fb7185',
    label:       'bg-rose-500/15 text-rose-300 border-rose-500/20',
  },
};

/* ─── Animated counter ───────────────────────────────────────────────────── */
const useAnimatedCounter = (target, duration = 1200) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
};

/* ─── Mini sparkline (SVG) ───────────────────────────────────────────────── */
// Shows a simple directional trend indicator based on the change direction.
// No hardcoded data — renders a rising or falling shape from the API direction.
const Sparkline = ({ color, positive }) => {
  // Two bars: previous (shorter) and current (taller) for up trend, reversed for down
  const bars = positive ? [45, 80] : [80, 45];

  const max  = Math.max(...bars);
  const H    = 28;
  const W    = 18;
  const barW = 6;
  const gap  = 6;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      {bars.map((v, i) => {
        const barH = (v / max) * H;
        const x    = i * (barW + gap);
        const y    = H - barH;
        return (
          <motion.rect
            key={i}
            x={x} y={y} width={barW} height={barH}
            rx={2}
            fill={color}
            fillOpacity={0.4 + (i / bars.length) * 0.6}
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            style={{ transformOrigin: `${x + barW / 2}px ${H}px` }}
          />
        );
      })}
    </svg>
  );
};

/* ─── SummaryCard ────────────────────────────────────────────────────────── */
/**
 * Props:
 *   type         'balance' | 'income' | 'expense'
 *   title        string
 *   rawAmount    number   — current month value
 *   change       number   — signed percentage (e.g. +12.5 or -5.3)
 *   changeLabel  string   — e.g. 'vs last month'
 *   prevAmount   number   — last month value (shown in footer)
 *   direction    'up'|'down'|'neutral'  — from API
 *   index        number
 */
const SummaryCard = ({ type, title, rawAmount, change, changeLabel, prevAmount, direction, index }) => {
  const theme = themeMap[type];

  // Color logic: green = increase, red = decrease
  // For expenses: up is BAD (red), down is GOOD (green)
  // For income/balance: up is GOOD (green), down is BAD (red)
  const isExpense   = type === 'expense';
  const isUp        = direction === 'up';
  const isDown      = direction === 'down';
  const isNeutral   = direction === 'neutral' || direction === undefined;

  // "positive" means good for the user
  const isGood = isExpense ? isDown : isUp;
  const isBad  = isExpense ? isUp   : isDown;

  const changeBadgeClass = isNeutral
    ? 'bg-white/10 text-white/40 border-white/10'
    : isGood
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/20';

  const counter = useAnimatedCounter(rawAmount, 1000 + index * 150);

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(n);

  const absChange = Math.abs(change ?? 0);
  const sign      = (change ?? 0) > 0 ? '+' : (change ?? 0) < 0 ? '−' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover="hovered"
      className={`
        group relative overflow-hidden rounded-2xl
        border ${theme.border}
        bg-white/[0.04] backdrop-blur-2xl
        shadow-2xl ${theme.glowShadow}
        p-6 flex flex-col gap-5
        cursor-default select-none
      `}
    >
      {/* ── Top shimmer line ── */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${theme.gradientTop}`} />

      {/* ── Hover glow overlay ── */}
      <motion.div
        variants={{ hovered: { opacity: 1 }, initial: { opacity: 0 } }}
        initial="initial"
        className="absolute inset-0 bg-white/[0.02] rounded-2xl pointer-events-none"
      />

      {/* ── Background orb ── */}
      <motion.div
        variants={{ hovered: { scale: 1.3, opacity: 0.18 }, initial: { scale: 1, opacity: 0.10 } }}
        initial="initial"
        transition={{ duration: 0.4 }}
        className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${theme.orb} blur-3xl pointer-events-none`}
      />

      {/* ── Row 1: label + icon ── */}
      <div className="flex items-start justify-between">
        <span className={`inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${theme.label}`}>
          {title}
        </span>
        <motion.div
          variants={{ hovered: { scale: 1.15, rotate: 6 }, initial: { scale: 1, rotate: 0 } }}
          initial="initial"
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`p-2.5 rounded-xl ${theme.iconBg} shadow-inner`}
        >
          {theme.icon}
        </motion.div>
      </div>

      {/* ── Row 2: animated amount + change badge ── */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <motion.p
            className="text-[2rem] font-extrabold text-white leading-none tracking-tight"
            variants={{ hovered: { scale: 1.03 }, initial: { scale: 1 } }}
            transition={{ duration: 0.2 }}
          >
            {formatINR(counter)}
          </motion.p>

          {/* Change badge */}
          <div className="flex items-center gap-2 mt-3">
            <motion.span
              key={`${change}-${direction}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${changeBadgeClass}`}
            >
              {!isNeutral && (
                isUp
                  ? <ArrowUpIcon />
                  : <ArrowDownIcon />
              )}
              {isNeutral ? '—' : `${sign}${absChange}%`}
            </motion.span>
            <span className="text-[11px] text-white/35 font-medium">{changeLabel}</span>
          </div>
        </div>

        {/* Sparkline — direction drives trend */}
        <motion.div
          variants={{ hovered: { opacity: 1, y: 0 }, initial: { opacity: 0.5, y: 4 } }}
          initial="initial"
          transition={{ duration: 0.3 }}
          className="shrink-0 pb-1"
        >
          <Sparkline color={theme.sparkColor} positive={isGood || isNeutral} />
        </motion.div>
      </div>

      {/* ── Bottom: prev month comparison ── */}
      <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
        <span className="text-[11px] text-white/30">
          {prevAmount !== undefined
            ? `Last month: ${formatINR(prevAmount)}`
            : type === 'balance'  ? 'Net position this month'
            : type === 'income'   ? 'Across all income sources'
            : 'Total outflows this month'}
        </span>
        <motion.span
          variants={{ hovered: { x: 3 }, initial: { x: 0 } }}
          transition={{ duration: 0.2 }}
          className={`text-[11px] font-semibold ${
            isNeutral ? 'text-white/20'
            : isGood  ? 'text-emerald-400/60'
            : 'text-rose-400/60'
          }`}
        >
          {isNeutral ? 'No change' : isGood ? '▲ Improved' : '▼ Declined'}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
