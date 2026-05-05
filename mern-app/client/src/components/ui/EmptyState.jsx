import { motion } from 'framer-motion';

/**
 * EmptyState — reusable empty/no-data placeholder
 */
const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  description = '',
  action = null,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center py-16 gap-4 text-center"
  >
    <motion.div
      initial={{ scale: 0.7 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl"
    >
      {icon}
    </motion.div>
    <div>
      <p className="text-sm font-semibold text-white/50">{title}</p>
      {description && (
        <p className="text-xs text-white/25 mt-1 max-w-xs">{description}</p>
      )}
    </div>
    {action && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {action}
      </motion.div>
    )}
  </motion.div>
);

export default EmptyState;
