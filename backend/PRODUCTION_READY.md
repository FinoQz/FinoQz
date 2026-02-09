# FinoQz Backend - Production-Ready Financial Quiz Platform

## 🎯 Overview

FinoQz has been transformed from a prototype with dummy data into a **production-ready, industry-level financial quiz platform** with complete backend infrastructure and real data connections.

## ✨ What's New

### 🗄️ Database Models (7 New Models)

1. **QuizAttempt** - Track user quiz attempts with full scoring
2. **Transaction** - Payment and transaction management
3. **Certificate** - Certificate issuance and verification
4. **CommunityPost** - Admin announcements and community posts
5. **Comment** - Comments on community posts
6. **Notification** - User notification system
7. **Wallet** - User wallet and balance management

### 🚀 API Endpoints (50+ New Routes)

#### Quiz Attempts
- `POST /api/quiz-attempts/start` - Start a new quiz attempt
- `POST /api/quiz-attempts/:attemptId/answer` - Save answer
- `POST /api/quiz-attempts/:attemptId/submit` - Submit quiz
- `GET /api/quiz-attempts/:attemptId` - Get attempt details
- `GET /api/quiz-attempts/user/all` - User's attempts
- `GET /api/quiz-attempts/quiz/:quizId` - Admin: all attempts for quiz

#### Transactions & Payments
- `POST /api/transactions/initiate` - Initiate payment
- `POST /api/transactions/verify` - Verify payment
- `GET /api/transactions/history` - User transaction history
- `GET /api/transactions/all` - Admin: all transactions
- `POST /api/transactions/:id/refund` - Admin: process refund
- `GET /api/transactions/revenue-stats` - Admin: revenue stats

#### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/add-funds` - Add funds to wallet
- `POST /api/wallet/deduct-funds` - Deduct from wallet
- `GET /api/wallet/transactions` - Wallet transaction history

#### Analytics (Admin)
- `GET /api/analytics/dashboard-stats` - KPI statistics
- `GET /api/analytics/user-growth` - User growth over time
- `GET /api/analytics/quiz-stats` - Quiz performance metrics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/top-performers` - Leaderboard
- `GET /api/analytics/category-performance` - Category stats

#### Community
- `GET /api/community/posts` - List posts
- `POST /api/community/posts` - Admin: create post
- `PUT /api/community/posts/:id` - Admin: update post
- `DELETE /api/community/posts/:id` - Admin: delete post
- `PATCH /api/community/posts/:id/pin` - Admin: pin/unpin
- `POST /api/community/posts/:id/like` - Like a post

#### Comments
- `POST /api/comments` - Add comment
- `GET /api/comments/:postId` - Get comments for post
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like comment

#### Certificates
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/certificates/user` - User's certificates
- `GET /api/certificates/verify/:code` - Verify certificate
- `GET /api/certificates/:id/download` - Download certificate
- `GET /api/certificates/all` - Admin: all certificates

#### Notifications
- `GET /api/notifications` - User notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `POST /api/notifications` - Admin: create notification
- `DELETE /api/notifications/:id` - Delete notification

### 🔒 Security Features

- ✅ JWT authentication on all protected routes
- ✅ Input validation using Celebrate/Joi
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Secure cookie handling
- ✅ Password hashing with bcrypt

### 📊 Frontend Integration

Updated pages now connect to real backend APIs:
- ✅ Admin Analytics Dashboard
- ✅ User Dashboard
- ✅ Community Posts Management
- ✅ Quiz Reports & Attempts
- ✅ Payments & Revenue Tracking

### ⚡ Real-time Features

- Socket.io with JWT authentication
- Admin room for live updates
- Live user tracking with Redis
- Real-time notifications
- Quiz submission events

### 📈 Performance Optimizations

- Database indexes on all models
- MongoDB aggregation pipelines
- Redis caching for analytics (with fallback)
- Pagination on all list endpoints
- Optimized queries with projections

### 🪵 Logging & Monitoring

- Winston structured logging
- Log levels (info, warn, error)
- Request/response logging with Morgan
- Health check endpoint (`/health`)
- Database health monitoring

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- Redis (optional, fallback available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FinoQz/FinoQz.git
   cd FinoQz/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Environment Variables

See `.env.example` for complete configuration options. Key variables:

```env
# Required
MONGO_URI=mongodb://localhost:27017/finoqz
JWT_SECRET=your-secret-key
PORT=3000

# Optional (with fallbacks)
REDIS_URL=redis://localhost:6379
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Payment Gateways (for production)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
STRIPE_SECRET_KEY=your_key

# File Storage
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
```

## 📖 API Documentation

### Authentication

Most endpoints require authentication. Include JWT token in:
- Cookie: `adminToken` or `userToken`
- Header: `Authorization: Bearer <token>`

### Response Format

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "message": "Error description"
}
```

### Pagination

List endpoints support pagination:
```
GET /api/resource?page=1&limit=20
```

Response includes:
```json
{
  "items": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 100
}
```

### Example: Complete Quiz Flow

1. **Start attempt**
   ```bash
   POST /api/quiz-attempts/start
   {
     "quizId": "quiz123"
   }
   ```

2. **Save answers**
   ```bash
   POST /api/quiz-attempts/:attemptId/answer
   {
     "questionId": "q1",
     "selectedAnswer": "A",
     "timeSpent": 30
   }
   ```

3. **Submit quiz**
   ```bash
   POST /api/quiz-attempts/:attemptId/submit
   ```
   Returns: `{ totalScore, percentage, certificateIssued }`

4. **Generate certificate** (if passed)
   ```bash
   POST /api/certificates/generate
   {
     "attemptId": "attempt123"
   }
   ```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-08T10:30:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "UP",
    "state": 1
  }
}
```

### Test Authentication
```bash
# Login as user
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use returned token
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer <token>"
```

## 📦 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection with winston
├── controllers/
│   ├── quizAttemptController.js
│   ├── transactionController.js
│   ├── certificateController.js
│   ├── communityController.js
│   ├── commentController.js
│   ├── analyticsController.js
│   ├── walletController.js
│   └── notificationController.js
├── models/
│   ├── QuizAttempt.js
│   ├── Transaction.js
│   ├── Certificate.js
│   ├── CommunityPost.js
│   ├── Comment.js
│   ├── Notification.js
│   └── Wallet.js
├── routes/
│   ├── quizAttemptRoutes.js
│   ├── transactionRoutes.js
│   ├── certificateRoutes.js
│   ├── communityRoutes.js
│   ├── commentRoutes.js
│   ├── analyticsRoutes.js
│   ├── walletRoutes.js
│   └── notificationRoutes.js
├── middlewares/
│   ├── verifyToken.js       # JWT verification
│   └── requireAdmin.js      # Admin authorization
├── utils/
│   ├── socket.js            # Socket.io with JWT auth
│   ├── redis.js             # Redis with fallback
│   └── logger.js            # Winston logger
├── server.js                # Main application file
└── .env.example            # Environment template
```

## 🔐 Security Best Practices

### For Production Deployment

1. **Change all secrets**
   - Generate strong JWT_SECRET
   - Use production payment gateway keys
   - Set unique ADMIN_WEBHOOK_SECRET

2. **Database Security**
   - Use MongoDB Atlas with SSL
   - Enable IP whitelisting
   - Use strong database passwords

3. **Enable HTTPS**
   - Configure SSL/TLS certificates
   - Use reverse proxy (nginx)
   - Set secure cookie flags

4. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Configure proper CORS origins
   - Enable Redis with TLS

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure log aggregation
   - Enable uptime monitoring

## 🐛 Troubleshooting

### Redis Connection Issues
If Redis is not available, the app uses a mock client automatically:
```
⚠️ REDIS_URL not set. Using mock Redis client.
```
This is normal for development. Analytics caching will be disabled.

### MongoDB Connection Errors
Check your `MONGO_URI` in `.env`:
- For local: `mongodb://localhost:27017/finoqz`
- For Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/finoqz`

### Port Already in Use
Change the `PORT` in `.env` or kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

## 📝 Migration Notes

### Upgrading from Prototype

If you have existing data:

1. **No breaking changes** to existing models
2. **New models** are independent
3. **Existing routes** remain functional
4. **New routes** are additive

## 🤝 Contributing

1. Follow existing code structure
2. Add JSDoc comments for functions
3. Use TypeScript types where applicable
4. Add validation for all inputs
5. Include error handling
6. Update this README for new features

## 📄 License

ISC License - See LICENSE file for details

## 🎉 Acknowledgments

- Express.js for the web framework
- MongoDB & Mongoose for database
- Socket.io for real-time features
- Winston for logging
- Celebrate/Joi for validation

---

**FinoQz** - Making Financial Education Accessible Through Interactive Quizzes
