# Migration Guide for Community Engagement System

## Breaking Changes

### Review Model Schema Changes

The Review model has been updated with breaking changes to field names:

**Old Schema:**
```javascript
{
  name: String (required),
  rating: Number,
  comment: String,  // OLD FIELD NAME
  email: String,
  status: String (enum: ['pending', 'approved', 'rejected']),  // OLD FIELD
  showOnLanding: Boolean  // OLD FIELD
}
```

**New Schema:**
```javascript
{
  name: String (default: 'Anonymous'),  // Now optional with default
  rating: Number,
  reviewText: String,  // NEW FIELD NAME (was 'comment')
  email: String,
  isPinned: Boolean,  // NEW FIELD (replaces showOnLanding)
  isApproved: Boolean  // NEW FIELD (replaces status)
}
```

### Required Migration Steps

#### 1. Database Migration

If you have existing review data, run this MongoDB migration script:

```javascript
// Connect to your database
use finoqz_db;  // Replace with your database name

// Migrate existing reviews
db.reviews.updateMany(
  {},
  [
    {
      $set: {
        // Rename 'comment' to 'reviewText'
        reviewText: "$comment",
        // Convert 'status' to 'isApproved'
        isApproved: {
          $cond: {
            if: { $eq: ["$status", "approved"] },
            then: true,
            else: false
          }
        },
        // Convert 'showOnLanding' to 'isPinned'
        isPinned: { $ifNull: ["$showOnLanding", false] },
        // Set default for name if missing
        name: { $ifNull: ["$name", "Anonymous"] }
      }
    },
    {
      $unset: ["comment", "status", "showOnLanding"]
    }
  ]
);

// Verify migration
db.reviews.findOne();
```

#### 2. API Client Updates

If you have any API clients or frontend code using the old API, update the field names:

**Old API Request:**
```javascript
POST /api/reviews
{
  "name": "John Doe",
  "rating": 5,
  "comment": "Great platform!",  // OLD
  "email": "john@example.com"
}
```

**New API Request:**
```javascript
POST /api/reviews
{
  "name": "John Doe",  // Optional - defaults to "Anonymous"
  "rating": 5,
  "reviewText": "Great platform!",  // NEW
  "email": "john@example.com"
}
```

**Old API Response:**
```javascript
{
  "reviews": [
    {
      "name": "John Doe",
      "rating": 5,
      "comment": "Great!",  // OLD
      "status": "approved",  // OLD
      "showOnLanding": true  // OLD
    }
  ]
}
```

**New API Response:**
```javascript
{
  "reviews": [
    {
      "name": "John Doe",
      "rating": 5,
      "reviewText": "Great!",  // NEW
      "isApproved": true,  // NEW
      "isPinned": true  // NEW
    }
  ]
}
```

## New Features

### Community Insights

New endpoints for community insights:
- `GET /api/insights` - Get all active insights
- `POST /api/insights` - Create new insight (authenticated)
- `POST /api/insights/:id/like` - Like/unlike insight
- `POST /api/insights/:id/comment` - Add comment
- `POST /api/insights/:id/share` - Share insight
- Admin endpoints under `/api/insights/admin/*`

### Finance Content

New endpoints for finance content:
- `GET /api/finance-content` - Get published content
- `GET /api/finance-content/:slug` - Get single content by slug
- Admin endpoints under `/api/finance-content/admin/*`

## Frontend Components

### New Landing Page Components
- `Reviews.tsx` - Anonymous review submission and display

### New User Dashboard Pages
- Updated `Community.tsx` - Interactive insights feed
- Updated `FinanceContent.tsx` - Browse finance articles

### New Admin Dashboard Pages
- `ReviewManagement.tsx` - Manage reviews
- `InsightsManagement.tsx` - Manage community insights
- `FinanceContentAdmin.tsx` - Manage finance content

## Configuration

Add to your frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Testing the Migration

1. Start the backend server
2. Run the database migration script
3. Test the following:
   - Submit a new review (should use `reviewText` field)
   - Fetch reviews (should return `reviewText`, `isApproved`, `isPinned`)
   - Admin can approve/pin reviews
   - Old reviews display correctly after migration

## Rollback Plan

If you need to rollback, run this reverse migration:

```javascript
db.reviews.updateMany(
  {},
  [
    {
      $set: {
        comment: "$reviewText",
        status: {
          $cond: {
            if: { $eq: ["$isApproved", true] },
            then: "approved",
            else: "pending"
          }
        },
        showOnLanding: { $ifNull: ["$isPinned", false] }
      }
    },
    {
      $unset: ["reviewText", "isApproved", "isPinned"]
    }
  ]
);
```

## Support

For any migration issues, please:
1. Check the console logs for errors
2. Verify database schema matches new model
3. Ensure all API clients are updated
4. Contact the development team if issues persist
