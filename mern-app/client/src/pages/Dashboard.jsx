import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTransactions from '../hooks/useTransactions';

// Layout
import Header from '../components/dashboard/Header';
import Divider from '../components/ui/Divider';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { SummaryCardSkeleton, TransactionSkeleton, AnalyticsSkeleton } from '../components/ui/Skeleton';

// Dashboard sections
import SummaryCard from '../components/dashboard/SummaryCard';
import SimulateButton from '../components/dashboard/SimulateButton';
import SimulateAlert from '../components/dashboard/SimulateAlert';
import AddExpenseModal from '../components/dashboard/AddExpenseModal';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetCalculator from '../components/dashboard/BudgetCalculator';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';
import SpendingInsights from '../components/dashboard/SpendingInsights';

/* ─── Background decoration ─────────────────────────────────────────────── */
const Background = () => (
  <>
    {/* Gradient orbs */}
    <div className="fixed top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
    <div className="fixed bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
    <div className="fixed top-1/2 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
    <div className="fixed top-1/3 right-0 w-48 h-48 bg-fuchsia-600/8 rounded-full blur-3xl pointer-events-none" />
    {/* Grid overlay */}
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  </>
);

/* ─── Offline banner ─────────────────────────────────────────────────────── */
const OfflineBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: -12, height: 0 }}
    animate={{ opacity: 1, y: 0, height: 'auto' }}
    exit={{ opacity: 0, y: -12, height: 0 }}
    className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl px-4 sm:px-5 py-3 flex items-start sm:items-center gap-3"
  >
    <span className="text-amber-400 text-lg shrink-0 mt-0.5 sm:mt-0">⚠️</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-amber-300">Offline Mode</p>
      <p className="text-xs text-amber-200/60 mt-0.5 leading-relaxed">
        Backend is unreachable. No data available — changes won't be saved.
      </p>
    </div>
  </motion.div>
);

/* ─── Section wrapper with error boundary ────────────────────────────────── */
const Section = ({ children, className = '' }) => (
  <ErrorBoundary>
    <div className={className}>{children}</div>
  </ErrorBoundary>
);

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const {
    transactions,
    summary,
    analytics,
    analyticsLoading,
    loading,
    isOffline,
    addTransaction,
    removeTransaction,
    refresh,
  } = useTransactions();

  const [modalOpen,     setModalOpen]     = useState(false);
  const [simulating,    setSimulating]    = useState(false);
  const [showAlert,     setShowAlert]     = useState(false);
  const [missingAmount, setMissingAmount] = useState(0);

  /* ── Simulate forgot-to-log ── */
  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setMissingAmount(+(Math.random() * 4000 + 800).toFixed(0));
      setSimulating(false);
      setShowAlert(true);
    }, 1400);
  };

  /* ── Build summary card data from live analytics ── */
  const { changes } = analytics;
  const toChange = (c) =>
    c.direction === 'up' ? +c.percent : c.direction === 'down' ? -c.percent : 0;

  const summaryCards = [
    {
      type: 'balance', title: 'Current Balance',
      rawAmount: summary.balance,
      change: toChange(changes.balance), direction: changes.balance.direction,
      prevAmount: analytics.lastMonth.balance, changeLabel: 'vs last month',
    },
    {
      type: 'income', title: 'Total Income',
      rawAmount: summary.totalIncome,
      change: toChange(changes.income), direction: changes.income.direction,
      prevAmount: analytics.lastMonth.income, changeLabel: 'vs last month',
    },
    {
      type: 'expense', title: 'Total Expenses',
      rawAmount: summary.totalExpense,
      change: toChange(changes.expense), direction: changes.expense.direction,
      prevAmount: analytics.lastMonth.expense, changeLabel: 'vs last month',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 relative">
      <Background />

      {/* ── Scrollable content ── */}
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* Header */}
          <Section>
            <Header onAddExpense={() => setModalOpen(true)} />
          </Section>

          {/* Banners */}
          <AnimatePresence>
            {isOffline && <OfflineBanner key="offline" />}
          </AnimatePresence>

          <AnimatePresence>
            {showAlert && (
              <SimulateAlert
                key="alert"
                isVisible={showAlert}
                onDismiss={() => setShowAlert(false)}
                missingAmount={missingAmount}
              />
            )}
          </AnimatePresence>

          {/* ── Summary cards ── */}
          <Section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {loading
                ? [0, 1, 2].map(i => <SummaryCardSkeleton key={i} />)
                : summaryCards.map((card, i) => (
                    <SummaryCard key={card.type} {...card} index={i} />
                  ))
              }
            </div>
          </Section>

          {/* Simulate button */}
          <Section>
            <SimulateButton onClick={handleSimulate} isSimulating={simulating} />
          </Section>

          <Divider className="my-2" />

          {/* ── Analytics ── */}
          <Section>
            {analyticsLoading
              ? (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-fuchsia-400 to-violet-500" />
                    <div className="h-5 w-24 rounded-lg bg-white/5 animate-pulse" />
                  </div>
                  <AnalyticsSkeleton />
                </div>
              )
              : <AnalyticsPanel analytics={analytics} loading={false} />
            }
          </Section>

          <Divider className="mt-8 mb-2" />

          {/* ── AI Spending Insights — self-contained, fetches /api/insights directly ── */}
          <Section>
            <SpendingInsights />
          </Section>

          <Divider className="mt-8 mb-2" />

          {/* ── Budget Calculator ── */}
          <Section>
            <BudgetCalculator
              currentBalance={summary.balance}
              onSimulate={() => {}}
            />
          </Section>

          <Divider className="mt-8 mb-2" />

          {/* ── Recent Transactions ── */}
          <Section>
            {loading ? (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
                  <div className="h-5 w-40 rounded-lg bg-white/5 animate-pulse" />
                </div>
                <TransactionSkeleton count={6} />
              </div>
            ) : (
              <RecentTransactions
                transactions={transactions}
                onDelete={removeTransaction}
              />
            )}
          </Section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          >
            <p className="text-xs text-white/15">
              Fintech Dashboard · {isOffline ? '⚠️ Offline Mode' : '🟢 Connected'}
            </p>
            <p className="text-xs text-white/10">
              Data refreshes on every transaction
            </p>
          </motion.footer>
        </div>
      </div>

      {/* ── Add Expense Modal ── */}
      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addTransaction}
      />
    </div>
  );
};

export default Dashboard;
