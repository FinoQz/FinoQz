# Community Engagement System - Feature Documentation

## Overview

The Community Engagement System adds three major features to the FinoQz platform:
1. **Anonymous Reviews** - User testimonials and feedback
2. **Community Insights** - Social feed with posts, likes, and comments
3. **Finance Content** - Educational articles and resources

## Features

### 1. Anonymous Reviews System

**User Features:**
- Submit reviews anonymously from the landing page
- Star rating system (1-5 stars)
- Optional name and email fields
- View pinned reviews on landing page

**Admin Features:**
- Review all submitted reviews
- Approve/unapprove reviews
- Pin/unpin reviews for landing page display
- Delete inappropriate reviews
- Search and filter reviews

**API Endpoints:**
- `POST /api/reviews` - Submit review (public)
- `GET /api/reviews/pinned` - Get pinned reviews (public)
- `GET /api/reviews/admin/all` - Get all reviews (admin)
- `PATCH /api/reviews/admin/:id/pin` - Toggle pin status (admin)
- `PATCH /api/reviews/admin/:id/approve` - Toggle approval (admin)
- `DELETE /api/reviews/admin/:id` - Delete review (admin)

### 2. Community Insights

**User Features:**
- View community insights feed
- Create new insights (up to 500 characters)
- Like insights
- Comment on insights
- Share insights (increments share count)
- View comments in modal with real-time updates

**Admin Features:**
- Create admin insights
- Pin/unpin insights for visibility
- Activate/deactivate insights
- Delete any insight
- View analytics dashboard:
  - Total insights, likes, comments, shares
  - Most engaged posts
  - Top contributors

**API Endpoints:**
- `GET /api/insights` - Get active insights (authenticated)
- `GET /api/insights/:id` - Get single insight with comments (authenticated)
- `POST /api/insights` - Create insight (authenticated)
- `POST /api/insights/:id/like` - Like/unlike insight (authenticated)
- `POST /api/insights/:id/comment` - Add comment (authenticated)
- `POST /api/insights/:id/share` - Share insight (authenticated)
- `POST /api/insights/comments/:commentId/like` - Like comment (authenticated)
- `DELETE /api/insights/:id` - Delete own insight (authenticated)
- `GET /api/insights/pinned` - Get pinned insights (public)
- Admin endpoints under `/api/insights/admin/*`

### 3. Finance Content

**User Features:**
- Browse published finance articles
- Search articles by title/excerpt
- Filter by category (Investment, Trading, Personal Finance, etc.)
- View detailed articles
- See view counts and publication dates
- Related content suggestions

**Admin Features:**
- Create new finance content
- Edit existing content
- Publish/unpublish content
- Delete content
- View analytics:
  - Total published/draft articles
  - Total views across all content
- Auto-generated SEO-friendly slugs

**API Endpoints:**
- `GET /api/finance-content` - Get published content (public)
- `GET /api/finance-content/:slug` - Get single article (public)
- Admin endpoints under `/api/finance-content/admin/*`

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with Redis session storage
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Database Models

### Review Model
```javascript
{
  name: String (default: "Anonymous"),
  email: String (optional),
  rating: Number (1-5, required),
  reviewText: String (required, max 1000 chars),
  isPinned: Boolean (default: false),
  isApproved: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### CommunityInsight Model
```javascript
{
  authorId: ObjectId (ref: User/Admin),
  authorModel: String (enum: ['Admin', 'User']),
  authorName: String,
  content: String (required),
  images: [String] (optional),
  category: String (optional),
  tags: [String] (optional),
  likes: [ObjectId] (User references),
  likeCount: Number (default: 0),
  commentCount: Number (default: 0),
  shareCount: Number (default: 0),
  isPinned: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### InsightComment Model
```javascript
{
  insightId: ObjectId (ref: CommunityInsight),
  userId: ObjectId (ref: User/Admin),
  userModel: String (enum: ['Admin', 'User']),
  userName: String,
  commentText: String (required, max 500 chars),
  likes: [ObjectId] (User references),
  likeCount: Number (default: 0),
  createdAt: Date
}
```

### FinanceContent Model
```javascript
{
  title: String (required),
  slug: String (unique, auto-generated),
  excerpt: String (max 300 chars),
  content: String (required),
  thumbnail: String (image URL),
  authorId: ObjectId (ref: Admin),
  authorName: String,
  category: String (enum),
  tags: [String],
  isPublished: Boolean (default: false),
  views: Number (default: 0),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Redis (for session management)

### Environment Configuration

1. Backend `.env`:
```bash
PORT=3000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=https://your-frontend-url.com
```

2. Frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

See [ENV_SETUP.md](ENV_SETUP.md) for complete configuration guide.

### Installation

1. **Backend Setup:**
```bash
cd backend
npm install
npm start
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

3. **Database Migration (if updating existing deployment):**

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for database migration instructions.

## Usage Examples

### Submit Anonymous Review
```javascript
const response = await axios.post('http://localhost:3000/api/reviews', {
  name: 'John Doe', // Optional
  email: 'john@example.com', // Optional
  rating: 5,
  reviewText: 'Great platform for learning finance!'
});
```

### Create Community Insight
```javascript
const response = await axios.post(
  'http://localhost:3000/api/insights',
  {
    content: 'Just completed my first investment quiz! 🎉'
  },
  {
    headers: { Authorization: `Bearer ${userToken}` }
  }
);
```

### Like an Insight
```javascript
const response = await axios.post(
  'http://localhost:3000/api/insights/123abc/like',
  {},
  {
    headers: { Authorization: `Bearer ${userToken}` }
  }
);
```

### Browse Finance Content
```javascript
const response = await axios.get('http://localhost:3000/api/finance-content', {
  params: {
    category: 'Investment',
    search: 'stocks',
    page: 1,
    limit: 12
  }
});
```

## Frontend Components

### Landing Page
- `Reviews.tsx` - Anonymous review submission and display

### User Dashboard
- `Community.tsx` - Interactive insights feed
- `FinanceContent.tsx` - Finance articles browser

### Admin Dashboard
- `ReviewManagement.tsx` - Review moderation
- `InsightsManagement.tsx` - Insights management with analytics
- `FinanceContentAdmin.tsx` - Content management

## Security Considerations

- ✅ JWT authentication for protected routes
- ✅ Role-based authorization (admin vs user)
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 requests/15 minutes globally)
- ✅ MongoDB injection protection via Mongoose
- ⚠️ CSRF protection (pre-existing infrastructure issue)

See [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) for detailed security review.

## Performance Optimizations

- Indexed database fields for faster queries
- Pagination on all list endpoints
- Lean queries for read-only operations
- View count incrementation without blocking response
- Redis caching for session tokens

## Known Limitations

1. **Rich Text Editor**: Finance content creation requires external rich text editor integration
2. **Image Uploads**: Image upload functionality needs Cloudinary integration
3. **Real-time Updates**: Like/comment counts update on page refresh (no WebSocket implementation)
4. **CSRF Protection**: Application-wide infrastructure improvement needed

## Future Enhancements

- [ ] Rich text editor for finance content
- [ ] Image upload for insights and content
- [ ] Real-time notifications using WebSockets
- [ ] Content moderation using AI
- [ ] Analytics dashboard for users
- [ ] Email notifications for admins
- [ ] Scheduled content publishing
- [ ] Content versioning
- [ ] Multi-language support

## Troubleshooting

### Common Issues

**Issue**: Reviews not appearing on landing page
- **Solution**: Ensure reviews are both approved AND pinned by admin

**Issue**: Cannot create insights
- **Solution**: Verify JWT token is present in Authorization header

**Issue**: Slug conflicts in finance content
- **Solution**: Slug auto-increments with counter (e.g., title-1, title-2)

**Issue**: 401 Unauthorized errors
- **Solution**: Check token expiration, verify Redis session exists

## Contributing

When contributing to the community engagement system:

1. Follow existing code patterns
2. Add input validation for new fields
3. Include authorization checks on protected routes
4. Update this documentation
5. Test on both mobile and desktop
6. Run security scans before submitting

## License

This feature is part of the FinoQz platform. See main project LICENSE.

## Support

For issues or questions:
- Check MIGRATION_GUIDE.md for database updates
- Review SECURITY_SUMMARY.md for security concerns
- Check ENV_SETUP.md for configuration issues
- Contact the development team for technical support

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
