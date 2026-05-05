import { motion } from 'framer-motion';

const Header = ({ onAddExpense }) => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10"
    >
      {/* Left */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Logo */}
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </motion.div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              Financial Dashboard
            </h1>
            {/* Live indicator */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/40 mt-0.5 leading-tight">
            <span className="hidden sm:inline">{greeting} · </span>
            {dateStr}
          </p>
        </div>
      </div>

      {/* Right */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAddExpense}
        className="
          self-start sm:self-auto
          inline-flex items-center gap-2 px-4 sm:px-5 py-2.5
          bg-emerald-500 hover:bg-emerald-400
          text-white text-sm font-bold
          rounded-xl shadow-lg shadow-emerald-500/25
          transition-colors duration-200
          active:scale-95
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Expense</span>
      </motion.button>
    </motion.header>
  );
};

export default Header;
