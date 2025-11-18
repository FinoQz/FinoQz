const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
