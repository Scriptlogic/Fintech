import { motion, AnimatePresence } from 'framer-motion';

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Bills: '📄', Health: '💊', Entertainment: '🎬', Other: '📦',
};

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white/80">Recent Transactions</h2>
        <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          {transactions.length} entries
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <AnimatePresence>
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`flex items-center gap-4 px-5 py-4 ${
                i < transactions.length - 1 ? 'border-b border-white/5' : ''
              } hover:bg-white/5 transition-colors`}
            >
              {/* Category icon */}
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                {categoryIcons[tx.category] || '📦'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                <p className="text-xs text-white/35 mt-0.5">{tx.category} · {tx.date}</p>
              </div>

              {/* Amount */}
              <span className={`text-sm font-bold shrink-0 ${
                tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TransactionList;
