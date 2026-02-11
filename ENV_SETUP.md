# Environment Variables

## Backend (.env)

```
# Server
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret

# Redis (for session management)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_redis_password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.com

# Email Service (for notifications)
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Gateway (if applicable)
CASHFREE_ENV=production
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
```

## Frontend (.env.local)

```
# API URL - Point to your backend server
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production
# NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

## Setup Instructions

### Backend Setup
1. Copy `.env.example` to `.env`
2. Fill in all required environment variables
3. Ensure MongoDB is running and accessible
4. Run `npm install` to install dependencies
5. Run `npm start` to start the server

### Frontend Setup
1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_API_URL` to your backend API URL
3. Run `npm install` to install dependencies
4. Run `npm run dev` for development or `npm run build && npm start` for production

## Important Notes

- Never commit `.env` or `.env.local` files to version control
- Keep your secrets secure
- Use different secrets for development and production
- Update CORS settings in backend to allow your frontend domain
