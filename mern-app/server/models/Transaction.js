const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0.01, 'Amount must be greater than 0'],
    },

    type: {
      type:     String,
      required: [true, 'Type is required'],
      enum:     {
        values:  ['income', 'expense'],
        message: 'Type must be either "income" or "expense"',
      },
    },

    category: {
      type:     String,
      required: [true, 'Category is required'],
      trim:     true,
      enum: {
        values: [
          'Food',
          'Transport',
          'Shopping',
          'Bills',
          'Health',
          'Entertainment',
          'Education',
          'Travel',
          'Income',
          'Other',
        ],
        message: 'Invalid category',
      },
    },

    date: {
      type:    Date,
      default: Date.now,
    },

    // Optional extra fields used by the dashboard
    subtitle: {
      type:  String,
      trim:  true,
      default: '',
    },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt
    versionKey: false,  // removes __v
  }
);

// Index for fast date-range queries (used by "last 7 days" filter)
transactionSchema.index({ date: -1 });
// Index for type-based aggregation (balance / income / expense totals)
transactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
