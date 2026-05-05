import { motion } from 'framer-motion';

const SimulateButton = ({ onClick, isSimulating }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex justify-center my-8"
    >
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        disabled={isSimulating}
        className={`
          relative inline-flex items-center gap-3 px-7 py-3.5
          rounded-2xl text-sm font-semibold
          border border-white/10
          bg-white/5 hover:bg-white/10
          backdrop-blur-xl
          text-white/80 hover:text-white
          shadow-xl shadow-black/20
          transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          overflow-hidden group
        `}
      >
        {/* Animated shimmer on hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

        {/* Icon */}
        <span className={`
          w-8 h-8 rounded-xl flex items-center justify-center shrink-0
          bg-gradient-to-br from-amber-400/20 to-orange-500/20
          text-amber-300
          ${isSimulating ? 'animate-spin' : ''}
        `}>
          {isSimulating ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </span>

        <span className="relative">
          {isSimulating ? 'Simulating...' : 'Simulate Forgot-to-Log Scenario'}
        </span>

        {/* Pulse dot */}
        {!isSimulating && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default SimulateButton;
