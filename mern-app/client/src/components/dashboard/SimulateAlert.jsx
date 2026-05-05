import { motion, AnimatePresence } from 'framer-motion';

const SimulateAlert = ({ isVisible, onDismiss, missingAmount }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl p-5"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-300 mb-1">
                Forgot-to-Log Scenario Detected
              </h3>
              <p className="text-xs text-amber-200/70 leading-relaxed">
                It looks like <span className="font-semibold text-amber-300">₹{missingAmount.toLocaleString('en-IN')}</span> in
                transactions may have been forgotten. Your current balance doesn't match
                expected projections. Consider reviewing your recent activity and logging
                any missing entries.
              </p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={onDismiss}
                  className="text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Review Transactions
                </button>
                <button
                  onClick={onDismiss}
                  className="text-xs text-amber-400/60 hover:text-amber-400/90 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onDismiss}
              className="text-amber-400/40 hover:text-amber-400/80 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimulateAlert;
