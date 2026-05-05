/**
 * Skeleton loaders — reusable shimmer placeholders
 */
import { motion } from 'framer-motion';

/* ─── Base shimmer block ─────────────────────────────────────────────────── */
export const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-xl bg-white/[0.05] ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

/* ─── Summary card skeleton ──────────────────────────────────────────────── */
export const SummaryCardSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col gap-5">
    <div className="flex items-start justify-between">
      <Shimmer className="h-6 w-28 rounded-full" />
      <Shimmer className="h-10 w-10 rounded-xl" />
    </div>
    <div className="flex flex-col gap-3">
      <Shimmer className="h-9 w-36" />
      <Shimmer className="h-5 w-24 rounded-full" />
    </div>
    <div className="border-t border-white/[0.06] pt-3 flex justify-between">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-4 w-16" />
    </div>
  </div>
);

/* ─── Transaction row skeleton ───────────────────────────────────────────── */
export const TransactionSkeleton = ({ count = 5 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
        <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-5 w-20 rounded-full" />
        <Shimmer className="h-5 w-16" />
      </div>
    ))}
  </div>
);

/* ─── Analytics skeleton ─────────────────────────────────────────────────── */
export const AnalyticsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    {[0, 1].map(i => (
      <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
        <Shimmer className="h-4 w-28" />
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} className="flex items-center gap-3 py-2">
            <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-3 w-36" />
            </div>
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

/* ─── Generic full-page loader ───────────────────────────────────────────── */
export const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <span className="text-lg">💎</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white/60">Loading Dashboard</p>
        <p className="text-xs text-white/25 mt-1">Fetching your financial data…</p>
      </div>
    </div>
  </div>
);
