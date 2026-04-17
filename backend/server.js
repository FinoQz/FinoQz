
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import path from 'path';
import { errors } from 'celebrate';
import { connectDB, dbHealth, logger } from './config/db.js';
import seedSuperAdmin from './utils/seedSuperAdmin.js';
import { initSocket } from './utils/socket.js';

import adminAuthRoutes from './routes/adminAuthRoutes.js';
import userSignupRoute from './routes/userSignupRoute.js';
import userLoginRoute from './routes/userLoginRoute.js';
import forgotPasswordRoute from './routes/forgotPasswordRoute.js';
import adminPanelRoute from './routes/adminPanelRoute.js';
import activityLogRoute from './routes/activityLogRoute.js';
import userProfile from './routes/userProfile.js';
import quizRoutes from './routes/quizRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import adminLanding from './routes/adminLanding.js';
import demoQuiz from './routes/demoQuiz.js';
import dashboardAnalytics from './routes/dashboardAnalytics.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import financeContentRoutes from './routes/financeContentRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import userDashboardRoutes from './routes/userDashboardRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import chatRoutes from './routes/chat.js';


const app = express();
const server = http.createServer(app);

// Remove rate limit for analytics endpoints (unlimited)
const analyticsLimiter = (req, res, next) => next();


// ✅ Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

// ✅ Connect DB & Seed Superadmin
(async () => {
  try {
    await connectDB();
    await seedSuperAdmin();
    logger.info('✅ MongoDB connected & Superadmin seeded');
  } catch (err) {
    logger.error('❌ DB connection or seeding failed:', { error: err.message });
    process.exit(1);
  }
})();

// ✅ CORS Setup
const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com',
  'https://www.finoqz.com',
  'https://fino-qz.vercel.app',
  /\.vercel\.app$/, // ✅ wildcard for all Vercel preview URLs
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : o.test(origin)
      )
    ) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// ✅ Middleware

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.set('trust proxy', 1);


// ✅ Static Files
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health Check Endpoint
app.get('/health', (req, res) => {
  const health = dbHealth();
  
  res.json({
    status: health.status === 'UP' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: health
  });
});


// ✅ Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/user/signup', userSignupRoute);
app.use('/api/user/login', userLoginRoute);
app.use('/api/user/forgot-password', forgotPasswordRoute);
app.use('/api/admin/panel', adminPanelRoute);
app.use('/api/admin/activity-logs', activityLogRoute);
app.use('/api/user/profile', userProfile);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin/landing', adminLanding);
app.use('/api/admin/demo-quiz', demoQuiz);
// Apply unlimited limiter to analytics endpoints
app.use('/api/admin/panel/analytics', analyticsLimiter, dashboardAnalytics);

// ✅ New Production Routes
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/finance-content', financeContentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/user/dashboard', userDashboardRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/public/chat', chatRoutes);


// ✅ Celebrate validation errors (with console logging for debugging)
app.use((err, req, res, next) => {
  if (err.joi) {
    console.error('❌ Joi Validation Error details:', JSON.stringify(err.joi.details, null, 2));
  }
  next(err);
});
app.use(errors());

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 FinoQz backend running on http://localhost:${PORT}`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
});
