/**
 * Divider — gradient horizontal rule
 */
const Divider = ({ className = '' }) => (
  <div className={`h-px bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`} />
);

export default Divider;
