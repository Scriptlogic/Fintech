import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'Food',          label: 'Food & Dining',      icon: '🍽️', color: 'text-orange-300',  bg: 'bg-orange-500/15',  border: 'border-orange-500/20'  },
  { value: 'Transport',     label: 'Transport',           icon: '🚗', color: 'text-sky-300',     bg: 'bg-sky-500/15',     border: 'border-sky-500/20'     },
  { value: 'Shopping',      label: 'Shopping',            icon: '🛍️', color: 'text-pink-300',    bg: 'bg-pink-500/15',    border: 'border-pink-500/20'    },
  { value: 'Bills',         label: 'Bills & Utilities',   icon: '📋', color: 'text-yellow-300',  bg: 'bg-yellow-500/15',  border: 'border-yellow-500/20'  },
  { value: 'Health',        label: 'Health & Fitness',    icon: '💊', color: 'text-teal-300',    bg: 'bg-teal-500/15',    border: 'border-teal-500/20'    },
  { value: 'Entertainment', label: 'Entertainment',       icon: '🎬', color: 'text-purple-300',  bg: 'bg-purple-500/15',  border: 'border-purple-500/20'  },
  { value: 'Education',     label: 'Education',           icon: '📚', color: 'text-blue-300',    bg: 'bg-blue-500/15',    border: 'border-blue-500/20'    },
  { value: 'Travel',        label: 'Travel',              icon: '✈️', color: 'text-indigo-300',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/20'  },
  { value: 'Other',         label: 'Other',               icon: '📦', color: 'text-slate-300',   bg: 'bg-slate-500/15',   border: 'border-slate-500/20'   },
];

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

/* ─── Animated number ────────────────────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      animate={{ opacity: 1,  y: 0,   filter: 'blur(0px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {formatINR(value)}
    </motion.span>
  );
};

/* ─── Balance ring ───────────────────────────────────────────────────────── */
const BalanceRing = ({ current, original }) => {
  const pct     = Math.max(0, Math.min(100, (current / original) * 100));
  const radius  = 54;
  const circ    = 2 * Math.PI * radius;
  const dash    = (pct / 100) * circ;
  const isLow   = pct < 30;
  const isMid   = pct >= 30 && pct < 60;
  const ringColor = isLow ? '#f87171' : isMid ? '#fbbf24' : '#34d399';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {/* Progress */}
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={Math.round(pct)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-extrabold text-white leading-none"
        >
          {Math.round(pct)}%
        </motion.span>
        <span className="text-[10px] text-white/35 mt-1 font-medium uppercase tracking-widest">
          remaining
        </span>
      </div>
    </div>
  );
};

/* ─── Simulation history item ────────────────────────────────────────────── */
const HistoryItem = ({ item, index }) => {
  const cat = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[8];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28, delay: index * 0.03 }}
      className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0"
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${cat.bg} border ${cat.border}`}>
        {cat.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/80 truncate">{cat.label}</p>
        <p className="text-[10px] text-white/30">{item.time}</p>
      </div>
      <span className="text-xs font-bold text-rose-400 shrink-0">
        −{formatINR(item.amount)}
      </span>
    </motion.div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
const BudgetCalculator = ({ currentBalance, onSimulate }) => {
  const [amount,      setAmount]      = useState('');
  const [category,    setCategory]    = useState('Food');
  const [error,       setError]       = useState('');
  const [isRunning,   setIsRunning]   = useState(false);
  const [history,     setHistory]     = useState([]);
  const [totalSpent,  setTotalSpent]  = useState(0);
  const [justAdded,   setJustAdded]   = useState(false);
  const inputRef = useRef(null);

  const originalBalance = currentBalance;
  const projectedBalance = currentBalance - totalSpent;
  const selectedCat = CATEGORIES.find(c => c.value === category);

  /* ── Validate ── */
  const validate = () => {
    const n = parseFloat(amount);
    if (!amount.trim() || isNaN(n) || n <= 0)
      return setError('Enter a valid amount greater than ₹0.'), false;
    if (n > projectedBalance)
      return setError(`Amount exceeds available balance of ${formatINR(projectedBalance)}.`), false;
    if (n > 500000)
      return setError('Amount cannot exceed ₹5,00,000 per simulation.'), false;
    setError('');
    return true;
  };

  /* ── Simulate ── */
  const handleSimulate = () => {
    if (!validate()) return;
    setIsRunning(true);

    setTimeout(() => {
      const n = parseFloat(amount);
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      setTotalSpent(prev => prev + n);
      setHistory(prev => [{ id: Date.now(), amount: n, category, time: now }, ...prev]);
      onSimulate?.(n, category);

      setAmount('');
      setIsRunning(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
      inputRef.current?.focus();
    }, 700);
  };

  /* ── Reset ── */
  const handleReset = () => {
    setTotalSpent(0);
    setHistory([]);
    setAmount('');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSimulate();
  };

  const isOverBudget = projectedBalance < 0;
  const isWarning    = projectedBalance >= 0 && projectedBalance < originalBalance * 0.2;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8"
    >
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
          <h2 className="text-base font-bold text-white/90 tracking-tight">Budget Calculator</h2>
          <span className="text-[10px] font-semibold text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Simulator
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-white/30 hover:text-rose-400 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* ── Main card ── */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden">

        {/* ── Over-budget banner ── */}
        <AnimatePresence>
          {isOverBudget && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500/15 border-b border-rose-500/20 px-5 py-3 flex items-center gap-2"
            >
              <span className="text-rose-400 text-sm">⚠️</span>
              <p className="text-xs font-semibold text-rose-300">
                Simulated expenses exceed your current balance!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Warning banner ── */}
        <AnimatePresence>
          {isWarning && !isOverBudget && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 flex items-center gap-2"
            >
              <span className="text-amber-400 text-sm">⚡</span>
              <p className="text-xs font-semibold text-amber-300">
                Less than 20% of your balance remaining — spend carefully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: Input panel (3 cols) ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Amount input */}
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Expense Amount
              </label>
              <div className="relative">
                {/* ₹ prefix */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm select-none">
                  ₹
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  className={`
                    w-full bg-white/[0.04] border rounded-xl
                    pl-8 pr-4 py-3.5
                    text-white text-lg font-bold placeholder-white/15
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${error
                      ? 'border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500/60'
                      : 'border-white/10 focus:ring-violet-500/20 focus:border-violet-500/40'}
                  `}
                />
                {/* Quick amount chips */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  {[500, 1000, 5000].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => { setAmount(String(q)); setError(''); }}
                      className="text-[10px] font-bold text-white/30 hover:text-violet-300 bg-white/5 hover:bg-violet-500/15 border border-white/10 hover:border-violet-500/30 px-1.5 py-0.5 rounded-md transition-all duration-150"
                    >
                      {q >= 1000 ? `${q/1000}k` : q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 text-xs text-rose-400 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Category dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Category
              </label>
              <div className="relative">
                {/* Selected icon preview */}
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none select-none">
                  {selectedCat?.icon}
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="
                    w-full appearance-none
                    bg-slate-800/80 border border-white/10
                    rounded-xl pl-10 pr-10 py-3.5
                    text-white text-sm font-semibold
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40
                    transition-all duration-200 cursor-pointer
                  "
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
                {/* Chevron */}
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Category tag preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <span className={`
                    inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                    px-2.5 py-1 rounded-full border
                    ${selectedCat?.bg} ${selectedCat?.color} ${selectedCat?.border}
                  `}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {selectedCat?.label}
                  </span>
                  <span className="text-[10px] text-white/25">selected</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Simulate button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSimulate}
              disabled={isRunning || !amount}
              className={`
                relative w-full py-3.5 rounded-xl
                font-bold text-sm text-white
                overflow-hidden
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isOverBudget
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg shadow-rose-500/20'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500'}
              `}
            >
              {/* Shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />

              <span className="relative flex items-center justify-center gap-2">
                {isRunning ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Simulating…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Simulate Expense
                  </>
                )}
              </span>
            </motion.button>

            {/* Balance result row */}
            <div className={`
              rounded-xl border p-4 transition-all duration-300
              ${justAdded
                ? 'border-violet-500/40 bg-violet-500/10'
                : isOverBudget
                  ? 'border-rose-500/30 bg-rose-500/8'
                  : 'border-white/8 bg-white/[0.02]'}
            `}>
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Current balance */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">Balance</p>
                  <p className="text-sm font-bold text-blue-300">
                    <AnimatedNumber value={currentBalance} />
                  </p>
                </div>
                {/* Simulated spend */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">Simulated</p>
                  <p className="text-sm font-bold text-rose-400">
                    <AnimatedNumber value={totalSpent} />
                  </p>
                </div>
                {/* Projected balance */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">Projected</p>
                  <p className={`text-sm font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                    <AnimatedNumber value={Math.max(0, projectedBalance)} />
                  </p>
                </div>
              </div>

              {/* Deduction breakdown */}
              <AnimatePresence>
                {totalSpent > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/[0.06]"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/30">
                        {formatINR(currentBalance)} − {formatINR(totalSpent)}
                      </span>
                      <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                        = {isOverBudget ? '−' : ''}{formatINR(Math.abs(projectedBalance))}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT: Visual panel (2 cols) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Balance ring */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col items-center gap-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Balance Health</p>
              <BalanceRing current={Math.max(0, projectedBalance)} original={originalBalance} />
              <div className="w-full grid grid-cols-3 gap-1 text-center">
                {[
                  { label: 'Safe',    range: '≥60%', color: 'text-emerald-400' },
                  { label: 'Caution', range: '30–60%', color: 'text-amber-400' },
                  { label: 'Low',     range: '<30%',  color: 'text-rose-400'   },
                ].map(({ label, range, color }) => (
                  <div key={label}>
                    <p className={`text-[10px] font-bold ${color}`}>{label}</p>
                    <p className="text-[9px] text-white/20">{range}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation history */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sim History</p>
                {history.length > 0 && (
                  <span className="text-[10px] text-white/20 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    {history.length} run{history.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {history.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-2"
                  >
                    <span className="text-2xl opacity-30">🧮</span>
                    <p className="text-[11px] text-white/20 text-center">
                      No simulations yet.<br />Enter an amount and hit Simulate.
                    </p>
                  </motion.div>
                ) : (
                  <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    <AnimatePresence>
                      {history.map((item, i) => (
                        <HistoryItem key={item.id} item={item} index={i} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default BudgetCalculator;
