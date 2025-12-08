// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const http = require('http');
// const connectDB = require('./config/db');
// const seedSuperAdmin = require('./utils/seedSuperAdmin');
// const initSocket = require('./utils/socket');   // ✅ import socket util

// const app = express();

// // DB + seed
// connectDB();
// seedSuperAdmin();

// // CORS config
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://finoqz.com',
//   'https://www.finoqz.com'
// ];
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// app.use(express.json());
// app.use(helmet());
// app.set('trust proxy', 1);
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many requests, please try again later.'
// }));

// // Routes
// app.use('/api/admin', require('./routes/adminAuthRoute'));
// app.use('/api/user/signup', require('./routes/userSignupRoute'));
// app.use('/api/user/login', require('./routes/userLoginRoute'));
// app.use('/api/user/forgot-password', require('./routes/forgotPasswordRoute'));
// app.use('/api/admin/panel', require('./routes/adminPanelRoute'));
// app.use('/api/admin/activity-logs', require('./routes/activityLogRoute'));
// app.use('/api/user/profile', require('./routes/userProfile'));
// app.use('/api/quizzes', require('./routes/quizRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/upload', require('./routes/uploadRoutes'));
// app.use('/api/questions', require('./routes/questionRoutes'));
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// app.use('/api/admin/landing', require('./routes/adminLanding'));
// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ message: 'Internal server error' });
// });

// // HTTP + Socket server
// const server = http.createServer(app);
// const io = initSocket(server);   // ✅ initialize socket
// app.set('io', io);               // make io available in controllers

// // Start server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`🚀 FinoQz backend running on http://localhost:${PORT}`);
// });
'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path'); // <-- ensure this is present
const connectDB = require('./config/db');
const seedSuperAdmin = require('./utils/seedSuperAdmin');
const initSocket = require('./utils/socket');

const app = express();

// DB + seed
connectDB();
seedSuperAdmin();

// CORS config
const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com',
  'https://www.finoqz.com'
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
app.set('trust proxy', 1);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
}));

// serve uploaded images statically (so frontend can access hero.imageUrl)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/admin', require('./routes/adminAuthRoute'));
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

// Mount landing admin route
app.use('/api/admin/landing', require('./routes/adminLanding'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// HTTP + Socket server
const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 FinoQz backend running on http://localhost:${PORT}`);
});