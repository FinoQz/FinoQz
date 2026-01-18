'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const { errors } = require('celebrate');
const connectDB = require('./config/db');
const seedSuperAdmin = require('./utils/seedSuperAdmin');
const { initSocket } = require('./utils/socket'); // destructured for clarity

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

// ✅ Connect DB & Seed Superadmin
(async () => {
  try {
    await connectDB();
    await seedSuperAdmin();
    console.log('✅ MongoDB connected & Superadmin seeded');
  } catch (err) {
    console.error('❌ DB connection or seeding failed:', err);
    process.exit(1);
  }
})();

// ✅ CORS Setup
const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com',
  'https://www.finoqz.com',
  'https://fino-qz.vercel.app',
  'https://fino-9fohhjger-finoqzs-projects.vercel.app',
  process.env.FRONTEND_URL,
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.set('trust proxy', 1);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
}));

// ✅ Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ Routes
app.use('/api/admin', require('./routes/adminAuthRoutes'));
app.use('/api/user/signup', require('./routes/userSignupRoute'));
app.use('/api/user/login', require('./routes/userLoginRoute'));
app.use('/api/user/forgot-password', require('./routes/forgotPasswordRoute'));
app.use('/api/admin/panel', require('./routes/adminPanelRoute'));
app.use('/api/admin/activity-logs', require('./routes/activityLogRoute'));
app.use('/api/user/profile', require('./routes/userProfile'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin/landing', require('./routes/adminLanding'));
app.use('/api/admin/demo-quiz', require('./routes/demoQuiz'));

// ✅ Celebrate validation errors
app.use(errors());

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack || err);
  res.status(500).json({ message: 'Internal server error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 FinoQz backend running on http://localhost:${PORT}`);
});
