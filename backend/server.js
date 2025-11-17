require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const seedSuperAdmin = require('./utils/seedSuperAdmin');
const app = express();

// 🔗 Connect to Azure Cosmos DB
connectDB();

// 👑 Seed default superadmin
seedSuperAdmin();

// 🛡️ Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
}));

// 🧭 Routes
app.use('/api/admin', require('./routes/adminAuthRoute'));         // Admin login + OTP
app.use('/api/user/signup', require('./routes/userSignupRoute'));  // User signup flow
app.use('/api/user/login', require('./routes/userLoginRoute'));    // Approved user login
app.use('/api/user/forgot-password', require('./routes/forgotPasswordRoute'));
app.use('/api/admin/panel', require('./routes/adminPanelRoute'));  // Admin dashboard



// ❌ Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FinoQz backend running on http://localhost:${PORT}`);
});
