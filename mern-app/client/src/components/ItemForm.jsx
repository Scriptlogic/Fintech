import { useState } from 'react';
import { motion } from 'framer-motion';

const ItemForm = ({ onAdd }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    await onAdd(form);
    setForm({ name: '', description: '' });
    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold text-gray-700">Add New Item</h2>
      <input
        type="text"
        name="name"
        placeholder="Item name *"
        value={form.name}
        onChange={handleChange}
        required
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
        rows={3}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Item'}
      </button>
    </motion.form>
  );
};

export default ItemForm;
