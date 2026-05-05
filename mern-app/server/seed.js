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

const SEED_DATA = [
  // Apr 29
  { title: 'Swiggy',           subtitle: 'Food delivery',        amount: 648,   type: 'expense', category: 'Food',          date: new Date('2026-04-29') },
  { title: 'Uber',             subtitle: 'Cab to office',        amount: 220,   type: 'expense', category: 'Transport',     date: new Date('2026-04-29') },
  // Apr 28
  { title: 'Amazon',           subtitle: 'Wireless earbuds',     amount: 2499,  type: 'expense', category: 'Shopping',      date: new Date('2026-04-28') },
  { title: 'Freelance Payment',subtitle: 'UI design project',    amount: 15000, type: 'income',  category: 'Income',        date: new Date('2026-04-28') },
  // Apr 27
  { title: 'Zomato',           subtitle: 'Dinner order',         amount: 430,   type: 'expense', category: 'Food',          date: new Date('2026-04-27') },
  { title: 'Netflix',          subtitle: 'Monthly subscription', amount: 649,   type: 'expense', category: 'Entertainment', date: new Date('2026-04-27') },
  { title: 'PhonePe Transfer', subtitle: 'Received from Rahul',  amount: 3000,  type: 'income',  category: 'Income',        date: new Date('2026-04-27') },
  // Apr 26
  { title: 'BigBasket',        subtitle: 'Weekly groceries',     amount: 1840,  type: 'expense', category: 'Food',          date: new Date('2026-04-26') },
  { title: 'Rapido',           subtitle: 'Bike ride',            amount: 85,    type: 'expense', category: 'Transport',     date: new Date('2026-04-26') },
  // Apr 25
  { title: 'Monthly Salary',   subtitle: 'April 2026 credit',    amount: 52000, type: 'income',  category: 'Income',        date: new Date('2026-04-25') },
  { title: 'Electricity Bill', subtitle: 'BESCOM — April',       amount: 1120,  type: 'expense', category: 'Bills',         date: new Date('2026-04-25') },
  { title: 'Cult.fit',         subtitle: 'Monthly membership',   amount: 1299,  type: 'expense', category: 'Health',        date: new Date('2026-04-25') },
  // Apr 24
  { title: 'Myntra',           subtitle: 'Casual shirt',         amount: 899,   type: 'expense', category: 'Shopping',      date: new Date('2026-04-24') },
  { title: 'Spotify',          subtitle: 'Premium plan',         amount: 119,   type: 'expense', category: 'Entertainment', date: new Date('2026-04-24') },
  { title: 'Ola',              subtitle: 'Airport drop',         amount: 540,   type: 'expense', category: 'Transport',     date: new Date('2026-04-24') },
  // Apr 23
  { title: 'Apollo Pharmacy',  subtitle: 'Medicines',            amount: 375,   type: 'expense', category: 'Health',        date: new Date('2026-04-23') },
  { title: 'Dividend Credit',  subtitle: 'HDFC Mutual Fund',     amount: 2200,  type: 'income',  category: 'Income',        date: new Date('2026-04-23') },
  { title: "Domino's Pizza",   subtitle: 'Weekend treat',        amount: 560,   type: 'expense', category: 'Food',          date: new Date('2026-04-23') },
];

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
