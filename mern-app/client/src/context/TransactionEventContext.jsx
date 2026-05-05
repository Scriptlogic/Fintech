/**
 * TransactionEventContext
 *
 * A lightweight event bus that lets useTransactions signal mutations
 * to any subscriber (e.g. useInsights) without prop drilling.
 *
 * How it works:
 *   - `mutationCount` is a plain integer that increments on every
 *     add or delete.
 *   - Any hook that needs to react to mutations watches this counter
 *     in a useEffect dependency array.
 *   - `notifyMutation()` is called by useTransactions after a
 *     successful API write.
 *
 * Usage:
 *   // Wrap the app (already done in App.jsx via TransactionEventProvider)
 *   <TransactionEventProvider>...</TransactionEventProvider>
 *
 *   // In useTransactions — signal a change
 *   const { notifyMutation } = useTransactionEvent();
 *   notifyMutation();
 *
 *   // In useInsights — react to changes
 *   const { mutationCount } = useTransactionEvent();
 *   useEffect(() => { silentRefresh(); }, [mutationCount]);
 */
import { createContext, useContext, useState, useCallback } from 'react';

const TransactionEventContext = createContext(null);

export const TransactionEventProvider = ({ children }) => {
  const [mutationCount, setMutationCount] = useState(0);

  const notifyMutation = useCallback(() => {
    setMutationCount(c => c + 1);
  }, []);

  return (
    <TransactionEventContext.Provider value={{ mutationCount, notifyMutation }}>
      {children}
    </TransactionEventContext.Provider>
  );
};

export const useTransactionEvent = () => {
  const ctx = useContext(TransactionEventContext);
  if (!ctx) throw new Error('useTransactionEvent must be used inside TransactionEventProvider');
  return ctx;
};
