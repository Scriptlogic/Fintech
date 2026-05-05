import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Config ─────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'Food',          label: 'Food',          icon: '🍽️', color: 'bg-orange-500/20 border-orange-500/30 text-orange-300'  },
  { value: 'Transport',     label: 'Transport',     icon: '🚗', color: 'bg-sky-500/20     border-sky-500/30     text-sky-300'     },
  { value: 'Shopping',      label: 'Shopping',      icon: '🛍️', color: 'bg-pink-500/20    border-pink-500/30    text-pink-300'    },
  { value: 'Bills',         label: 'Bills',         icon: '📋', color: 'bg-yellow-500/20  border-yellow-500/30  text-yellow-300'  },
  { value: 'Health',        label: 'Health',        icon: '💊', color: 'bg-teal-500/20    border-teal-500/30    text-teal-300'    },
  { value: 'Entertainment', label: 'Entertain',     icon: '🎬', color: 'bg-purple-500/20  border-purple-500/30  text-purple-300'  },
  { value: 'Education',     label: 'Education',     icon: '📚', color: 'bg-blue-500/20    border-blue-500/30    text-blue-300'    },
  { value: 'Travel',        label: 'Travel',        icon: '✈️', color: 'bg-indigo-500/20  border-indigo-500/30  text-indigo-300'  },
  { value: 'Income',        label: 'Income',        icon: '💰', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
  { value: 'Other',         label: 'Other',         icon: '📦', color: 'bg-slate-500/20   border-slate-500/30   text-slate-300'   },
];

const INITIAL_FORM = {
  title:    '',
  subtitle: '',
  amount:   '',
  category: 'Food',
  type:     'expense',
};

const formatINR = (n) =>
  isNaN(n) || n === '' ? '₹0'
  : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

/* ─── Field animation variants ──────────────────────────────────────────── */
const fieldVariants = {
  hidden:  { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Success checkmark ──────────────────────────────────────────────────── */
const SuccessView = ({ title, amount, type, onDone }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="flex flex-col items-center justify-center py-8 gap-5"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
      className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center"
    >
      <motion.svg
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        className="w-10 h-10 text-emerald-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <motion.path
          strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </motion.svg>
    </motion.div>

    <div className="text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg font-bold text-white"
      >
        Transaction Added!
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-white/50 mt-1"
      >
        <span className="font-semibold text-white/80">{title}</span>
        {' '}·{' '}
        <span className={type === 'income' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
          {type === 'income' ? '+' : '−'}{formatINR(parseFloat(amount))}
        </span>
      </motion.p>
    </div>

    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      onClick={onDone}
      className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition-colors"
    >
      Done
    </motion.button>
  </motion.div>
);

/* ─── Main modal ─────────────────────────────────────────────────────────── */
const AddExpenseModal = ({ isOpen, onClose, onAdd }) => {
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const titleRef = useRef(null);

  /* Auto-focus title on open */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 120);
    }
  }, [isOpen]);

  /* Reset on close */
  const handleClose = () => {
    if (loading) return;
    setForm(INITIAL_FORM);
    setErrors({});
    setSuccess(false);
    onClose();
  };

  /* Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loading]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /* Validate */
  const validate = () => {
    const e = {};
    if (!form.title.trim())                                    e.title  = 'Title is required';
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await onAdd({
        title:    form.title.trim(),
        subtitle: form.subtitle.trim() || form.category,
        amount:   parseFloat(form.amount),
        type:     form.type,
        category: form.category,
      });
      setSuccess(true);
      /* Auto-close after 1.8 s */
      setTimeout(() => {
        setForm(INITIAL_FORM);
        setErrors({});
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save. Is the server running?' });
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.value === form.category);
  const parsedAmount = parseFloat(form.amount);
  const hasAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />

          {/* ── Modal wrapper ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 32 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{   opacity: 0, scale: 0.9,  y: 32 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-lg">

              {/* Glow behind card */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-fuchsia-600/20 rounded-3xl blur-xl pointer-events-none" />

              {/* Card */}
              <div className="relative bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${
                  form.type === 'income'
                    ? 'from-emerald-500 via-teal-400 to-emerald-600'
                    : 'from-blue-500 via-purple-500 to-fuchsia-500'
                }`} />

                <div className="p-6">
                  {/* ── Header ── */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        key={form.type}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1,   opacity: 1 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                          ${form.type === 'income' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}
                      >
                        {form.type === 'income' ? '💰' : '💸'}
                      </motion.div>
                      <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                          {success ? 'Transaction Saved' : 'Add Transaction'}
                        </h2>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={form.type}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-white/35 mt-0.5"
                          >
                            {form.type === 'income' ? 'Recording an income entry' : 'Recording an expense entry'}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* ── Success view ── */}
                  <AnimatePresence mode="wait">
                    {success ? (
                      <SuccessView
                        key="success"
                        title={form.title}
                        amount={form.amount}
                        type={form.type}
                        onDone={handleClose}
                      />
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-4"
                      >
                        {/* ── Type toggle ── */}
                        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                          <div className="flex rounded-xl border border-white/10 p-1 bg-white/[0.03] gap-1">
                            {[
                              { value: 'expense', label: 'Expense', icon: '↑', active: 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25' },
                              { value: 'income',  label: 'Income',  icon: '↓', active: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25' },
                            ].map((t) => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => set('type', t.value)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-250 ${
                                  form.type === t.value ? `${t.active} text-white` : 'text-white/30 hover:text-white/60'
                                }`}
                              >
                                <span className="text-base">{t.icon}</span>
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>

                        {/* ── Title ── */}
                        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                            Title <span className="text-rose-400">*</span>
                          </label>
                          <input
                            ref={titleRef}
                            type="text"
                            placeholder="e.g. Swiggy, Monthly Salary"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            maxLength={100}
                            className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm
                              focus:outline-none focus:ring-2 transition-all duration-200
                              ${errors.title
                                ? 'border-rose-500/50 focus:ring-rose-500/20'
                                : 'border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20'}`}
                          />
                          <AnimatePresence>
                            {errors.title && (
                              <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                                className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.title}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* ── Note ── */}
                        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                            Note <span className="normal-case font-normal text-white/20">(optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Food delivery, April salary"
                            value={form.subtitle}
                            onChange={(e) => set('subtitle', e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                          />
                        </motion.div>

                        {/* ── Amount ── */}
                        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                            Amount <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm select-none">₹</span>
                            <input
                              type="number"
                              placeholder="0"
                              min="1"
                              step="1"
                              value={form.amount}
                              onChange={(e) => set('amount', e.target.value)}
                              className={`w-full bg-white/[0.04] border rounded-xl pl-8 pr-28 py-3 text-white text-lg font-bold placeholder-white/15
                                focus:outline-none focus:ring-2 transition-all duration-200
                                ${errors.amount
                                  ? 'border-rose-500/50 focus:ring-rose-500/20'
                                  : 'border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20'}`}
                            />
                            {/* Quick chips */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                              {[500, 1000, 5000].map(q => (
                                <button key={q} type="button"
                                  onClick={() => set('amount', String(q))}
                                  className="text-[10px] font-bold text-white/30 hover:text-violet-300 bg-white/5 hover:bg-violet-500/15 border border-white/10 hover:border-violet-500/30 px-1.5 py-0.5 rounded-md transition-all">
                                  {q >= 1000 ? `${q/1000}k` : q}
                                </button>
                              ))}
                            </div>
                          </div>
                          <AnimatePresence>
                            {errors.amount && (
                              <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                                className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.amount}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* ── Category grid ── */}
                        <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                          <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                            Category <span className="text-rose-400">*</span>
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {CATEGORIES.map((cat) => (
                              <motion.button
                                key={cat.value}
                                type="button"
                                onClick={() => set('category', cat.value)}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-all duration-200
                                  ${form.category === cat.value
                                    ? `${cat.color} shadow-lg`
                                    : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:bg-white/[0.07] hover:text-white/60'}`}
                              >
                                <span className="text-base leading-none">{cat.icon}</span>
                                <span className="text-[9px] font-bold leading-none truncate w-full text-center">{cat.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>

                        {/* ── Live preview ── */}
                        <AnimatePresence>
                          {(form.title || hasAmount) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className={`rounded-xl border px-4 py-3 flex items-center gap-3
                                ${form.type === 'income'
                                  ? 'bg-emerald-500/8 border-emerald-500/20'
                                  : 'bg-blue-500/8 border-blue-500/20'}`}
                              >
                                <span className="text-xl">{selectedCat?.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white/80 truncate">
                                    {form.title || 'Untitled'}
                                  </p>
                                  <p className="text-[10px] text-white/30">{selectedCat?.label}</p>
                                </div>
                                <AnimatePresence mode="wait">
                                  <motion.span
                                    key={form.amount + form.type}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    className={`text-sm font-bold shrink-0 ${form.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                                  >
                                    {form.type === 'income' ? '+' : '−'}{hasAmount ? formatINR(parsedAmount) : '₹0'}
                                  </motion.span>
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* ── Submit error ── */}
                        <AnimatePresence>
                          {errors.submit && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5"
                            >
                              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              </svg>
                              <p className="text-xs text-rose-300">{errors.submit}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* ── Submit button ── */}
                        <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.97 }}
                            className={`relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden
                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                              flex items-center justify-center gap-2
                              ${form.type === 'income'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/25 hover:from-blue-400 hover:to-purple-500'}`}
                          >
                            {/* Shimmer */}
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                            {loading ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Saving to database…
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Add {form.type === 'income' ? 'Income' : 'Expense'}
                                {hasAmount && (
                                  <span className="ml-1 opacity-70 font-normal">
                                    · {formatINR(parsedAmount)}
                                  </span>
                                )}
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;
