import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { TransactionEventProvider } from './context/TransactionEventContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <TransactionEventProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>
      </ToastProvider>
    </TransactionEventProvider>
  );
}

export default App;
