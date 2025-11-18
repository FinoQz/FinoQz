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
const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(helmet());

// 👇 Trust proxy BEFORE rate-limit
app.set('trust proxy', 1);

// ⏳ Rate limit middleware
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,   // RFC standard headers
  legacyHeaders: false,    // disable old X-RateLimit headers
  message: 'Too many requests, please try again later.'
}));

// 🧭 Routes
app.use('/api/admin', require('./routes/adminAuthRoute'));         
app.use('/api/user/signup', require('./routes/userSignupRoute'));  
app.use('/api/user/login', require('./routes/userLoginRoute'));    
app.use('/api/user/forgot-password', require('./routes/forgotPasswordRoute'));
app.use('/api/admin/panel', require('./routes/adminPanelRoute'));  

// ❌ Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FinoQz backend running on http://localhost:${PORT}`);
});
