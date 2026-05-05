/**
 * Seed script — populates the DB with the same 18 dummy transactions
 * used in the frontend (src/data/transactions.js).
 *
 * Usage:
 *   node seed.js          → insert seed data
 *   node seed.js --clear  → wipe the collection only
 */
require('dotenv').config();

const mongoose    = require('mongoose');
const Transaction = require('./models/Transaction');

const SEED_DATA = [];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Always clear first
    await Transaction.deleteMany({});
    console.log('🗑️   Cleared existing transactions');

    if (!process.argv.includes('--clear')) {
      await Transaction.insertMany(SEED_DATA);
      console.log(`🌱  Seeded ${SEED_DATA.length} transactions`);
    }

    console.log('✅  Done');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
