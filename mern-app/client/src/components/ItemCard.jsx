import { motion } from 'framer-motion';

const ItemCard = ({ item, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-start"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(item._id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </motion.div>
  );
};

export default ItemCard;
