/**
 * Toast notification system
 * Usage: import { useToast } from './Toast'
 *        const toast = useToast()
 *        toast.success('Transaction added!')
 *        toast.error('Failed to save')
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  error:   'bg-rose-500/15    border-rose-500/30    text-rose-300',
  info:    'bg-blue-500/15    border-blue-500/30    text-blue-300',
};

const Toast = ({ id, type, message, onDismiss }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -16, scale: 0.95 }}
    animate={{ opacity: 1, y: 0,   scale: 1    }}
    exit={{   opacity: 0, y: -16, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    className={`flex items-start gap-3 rounded-xl border backdrop-blur-xl px-4 py-3 shadow-xl min-w-[280px] max-w-md ${STYLES[type]}`}
  >
    <div className="shrink-0 mt-0.5">{ICONS[type]}</div>
    <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
    <button
      onClick={() => onDismiss(id)}
      className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </motion.div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((type, message, duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    success: (msg, dur) => show('success', msg, dur),
    error:   (msg, dur) => show('error',   msg, dur),
    info:    (msg, dur) => show('info',    msg, dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
