import { Component } from 'react';
import { motion } from 'framer-motion';

/**
 * ErrorBoundary — catches render errors and shows a recovery UI.
 * Wrap any section that might fail with <ErrorBoundary>.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-rose-500/20 bg-rose-500/8 backdrop-blur-xl p-6 flex flex-col items-center gap-4 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div>
          <p className="text-sm font-bold text-rose-300">Something went wrong</p>
          <p className="text-xs text-rose-300/60 mt-1 max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred in this section.'}
          </p>
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }
}

export default ErrorBoundary;
