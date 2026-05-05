const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI environment variable is not set.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ no longer needs these flags, but kept for clarity
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    console.log(`    Database: ${conn.connection.name}`);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1); // Exit with failure — no point running without DB
  }
};

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n🔌  MongoDB connection closed (SIGINT)');
  process.exit(0);
});

module.exports = connectDB;
