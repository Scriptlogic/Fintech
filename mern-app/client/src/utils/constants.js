/**
 * App-wide constants
 */

export const CATEGORIES = [
  { value: 'Food',          label: 'Food & Dining',    icon: '🍽️', color: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/20', bar: 'bg-orange-400', dot: 'bg-orange-400' } },
  { value: 'Transport',     label: 'Transport',        icon: '🚗', color: { bg: 'bg-sky-500/15',    text: 'text-sky-300',    border: 'border-sky-500/20',    bar: 'bg-sky-400',    dot: 'bg-sky-400'    } },
  { value: 'Shopping',      label: 'Shopping',         icon: '🛍️', color: { bg: 'bg-pink-500/15',   text: 'text-pink-300',   border: 'border-pink-500/20',   bar: 'bg-pink-400',   dot: 'bg-pink-400'   } },
  { value: 'Bills',         label: 'Bills & Utilities',icon: '📋', color: { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/20', bar: 'bg-yellow-400', dot: 'bg-yellow-400' } },
  { value: 'Health',        label: 'Health & Fitness', icon: '💊', color: { bg: 'bg-teal-500/15',   text: 'text-teal-300',   border: 'border-teal-500/20',   bar: 'bg-teal-400',   dot: 'bg-teal-400'   } },
  { value: 'Entertainment', label: 'Entertainment',    icon: '🎬', color: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/20', bar: 'bg-purple-400', dot: 'bg-purple-400' } },
  { value: 'Education',     label: 'Education',        icon: '📚', color: { bg: 'bg-blue-500/15',   text: 'text-blue-300',   border: 'border-blue-500/20',   bar: 'bg-blue-400',   dot: 'bg-blue-400'   } },
  { value: 'Travel',        label: 'Travel',           icon: '✈️', color: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/20', bar: 'bg-indigo-400', dot: 'bg-indigo-400' } },
  { value: 'Income',        label: 'Income',           icon: '💰', color: { bg: 'bg-emerald-500/15',text: 'text-emerald-300',border: 'border-emerald-500/20',bar: 'bg-emerald-400',dot: 'bg-emerald-400'} },
  { value: 'Other',         label: 'Other',            icon: '📦', color: { bg: 'bg-slate-500/15',  text: 'text-slate-300',  border: 'border-slate-500/20',  bar: 'bg-slate-400',  dot: 'bg-slate-400'  } },
];

export const getCategoryConfig = (value) =>
  CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

export const TRANSACTION_TYPES = ['income', 'expense'];

export const ANIMATION = {
  page:  { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } },
  card:  { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  fade:  { initial: { opacity: 0 },        animate: { opacity: 1 },        transition: { duration: 0.3 } },
  slide: { initial: { opacity: 0, x: -16 },animate: { opacity: 1, x: 0 }, transition: { duration: 0.35 } },
};
