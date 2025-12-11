# Frontend-Backend Integration Guide

## Overview
This document outlines the integration work completed to connect the three frontend applications (customer frontend, admin panel, and advertiser panel) with the backend API.

## Completed Work

### 1. Backend API Infrastructure ✅
- **Created API service files** for all three frontends:
  - `frontend/src/api/api.js` - Customer frontend API
  - `admin-panel/src/api/api.js` - Admin panel API
  - `advertiser-panel/src/api/api.js` - Advertiser panel API

- **Added missing backend endpoints**:
  - User routes: `/api/user/profile`, `/api/user/entries`, `/api/user/position`
  - Draw routes: `/api/draws`, `/api/draws/:drawId/leaderboard`, `/api/draws/entries`, `/api/draws/position`
  - Advertiser routes: `/api/advertiser/campaigns`, `/api/advertiser/billboards`, `/api/advertiser/analytics`, `/api/advertiser/invoices`, `/api/advertiser/account`
  - Ads routes: `/api/ads/platform/:platform` (for fetching ads on social media pages)

- **Updated database schema** (`init_db.sql`):
  - Added `advertiser_id` to `billboards` table
  - Added `platform` field to `ads` table
  - Created `campaigns` table for advertiser campaigns
  - Created `invoices` table for advertiser billing
  - Added `billboard_id` to `uploads` table

- **CORS Configuration**:
  - Updated `src/app.js` to allow requests from all frontend origins
  - Configured for development and production environments

### 2. Authentication & Authorization ✅
- Fixed `auth` middleware to support role-based access control
- All routes properly protected with appropriate role checks
- JWT token handling implemented in all API service files

### 3. Frontend Integration Started ✅
- **Signup Page**: Updated to use real API (`authAPI.register`)
- **API Service Files**: Created with proper error handling and token management

## Remaining Work

### 1. Frontend Form Integration (High Priority)
- [ ] **Homepage Billboard Search**: Connect postal code search to `/api/billboards/search`
  - Add state management for postal codes (4 inputs)
  - Implement search handler
  - Display results (separate by age: <3 months vs >=3 months)

- [ ] **Social Media Upload Pages**: Connect upload functionality
  - Add file upload handler using `uploadAPI.uploadImage`
  - Pass platform name from URL parameter
  - Show upload progress and success/error messages
  - Fetch and display user's uploads for that platform

- [ ] **Login Functionality**: Create login page or add to WelcomePage
  - Use `authAPI.login`
  - Store token and redirect on success
  - Handle authentication errors

- [ ] **Analysis/Position Page**: Connect to user position API
  - Fetch user entries: `drawAPI.getUserEntries()`
  - Fetch user position: `drawAPI.getUserPosition()`
  - Display leaderboard: `drawAPI.getLeaderboard(drawId)`

### 2. Admin Panel Integration (Medium Priority)
- [ ] Replace `mockApi.js` usage with real API calls from `api.js`
- [ ] Update all pages to use real endpoints:
  - UsersPage: Use `usersAPI`
  - UploadsPage: Use `uploadsAPI`
  - DrawsPage: Use `drawsAPI`
  - AdsPage: Use `adsAPI`
  - PolicyPage: Use `pagesAPI`
- [ ] Add authentication check and redirect to login if not authenticated

### 3. Advertiser Panel Integration (Medium Priority)
- [ ] Replace `mockApi.js` usage with real API calls from `api.js`
- [ ] Update all pages:
  - CampaignsPage: Use `campaignsAPI`
  - AnalyticsPage: Use `analyticsAPI`
  - BillingPage: Use `billingAPI`
  - AccountPage: Use `accountAPI`
  - GeoTargetingPage: Use `billboardsAPI`
  - MediaUploadPage: Connect to media upload endpoint (needs to be created)
- [ ] Add authentication check

### 4. Additional Features Needed
- [ ] **Ads Display on Social Media Pages**: 
  - Fetch ads for each platform: `adsAPI.getAdsForPlatform(platform, placement)`
  - Display in 4 medium rectangles, 2 leaderboard, 2 skyscraper positions
  - Rotate ads based on region (30-mile radius)

- [ ] **Weekly Email Functionality**:
  - Create email service endpoint
  - Send weekly position updates to users
  - Include advertiser messages in emails

- [ ] **Tag Tracking** (if possible):
  - Track social media tags in uploads
  - Display tag count to users
  - Use as incentive metric

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User (Protected)
- `GET /api/user/profile` - Get user profile
- `GET /api/user/entries` - Get user's entries
- `GET /api/user/position` - Get user's leaderboard position

### Uploads (Protected)
- `POST /api/uploads` - Upload image (multipart/form-data)
- `GET /api/uploads/user` - Get user's uploads

### Billboards (Public)
- `POST /api/billboards/search` - Search billboards by postal codes

### Draws
- `GET /api/draws` - Get all draws (public)
- `GET /api/draws/:drawId/leaderboard` - Get leaderboard (public)
- `GET /api/draws/entries` - Get user entries (protected)
- `GET /api/draws/position` - Get user position (protected)
- `POST /api/draws/entry` - Generate entry (protected, user only)

### Ads (Public)
- `GET /api/ads/platform/:platform?placement=...` - Get ads for platform

### Admin (Protected, admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/uploads` - Get all uploads
- `DELETE /api/admin/uploads/:id` - Delete upload
- `GET /api/admin/draws` - Get all draws
- `POST /api/admin/draws` - Create draw
- `PUT /api/admin/draws/:id` - Update draw
- `DELETE /api/admin/draws/:id` - Delete draw
- `GET /api/admin/ads` - Get all ads
- `POST /api/admin/ads` - Create ad
- `PUT /api/admin/ads/:id` - Update ad
- `DELETE /api/admin/ads/:id` - Delete ad
- `GET /api/admin/pages` - Get static pages
- `PUT /api/admin/pages/:slug` - Update static page

### Advertiser (Protected, advertiser/admin only)
- `GET /api/advertiser/campaigns` - Get advertiser campaigns
- `POST /api/advertiser/campaigns` - Create campaign
- `PUT /api/advertiser/campaigns/:id` - Update campaign
- `DELETE /api/advertiser/campaigns/:id` - Delete campaign
- `GET /api/advertiser/billboards` - Get advertiser billboards
- `POST /api/advertiser/billboards` - Create billboard
- `PUT /api/advertiser/billboards/:id` - Update billboard
- `GET /api/advertiser/analytics` - Get analytics
- `GET /api/advertiser/invoices` - Get invoices
- `GET /api/advertiser/account` - Get account
- `PUT /api/advertiser/account` - Update account

## Environment Variables

Create `.env` files in each frontend directory:

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:4000/api
```

### admin-panel/.env
```
VITE_API_BASE_URL=http://localhost:4000/api
```

### advertiser-panel/.env
```
VITE_API_BASE_URL=http://localhost:4000/api
```

### backend/.env
```
PORT=4000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
UPLOADS_DIR=src/uploads
UPLOAD_LIMIT=15
FRONTEND_URL=http://localhost:5173
ADMIN_PANEL_URL=http://localhost:5174
ADVERTISER_PANEL_URL=http://localhost:5175
NODE_ENV=development
```

## Testing Checklist

1. ✅ Backend server starts without errors
2. ✅ CORS allows frontend requests
3. ⏳ User registration works
4. ⏳ User login works
5. ⏳ Image upload works
6. ⏳ Billboard search works
7. ⏳ Admin panel can manage users, uploads, draws, ads
8. ⏳ Advertiser panel can manage campaigns and billboards
9. ⏳ Leaderboard displays correctly
10. ⏳ User position tracking works

## Next Steps

1. **Immediate**: Complete frontend form integrations (signup, login, search, upload)
2. **Short-term**: Replace mock APIs in admin and advertiser panels
3. **Medium-term**: Add ads display on social media pages
4. **Long-term**: Implement email service and advanced analytics

## Notes

- All API calls include automatic token handling
- Error handling is implemented in API service files
- CORS is configured to allow all origins in development
- Database schema supports all required features
- Authentication middleware properly checks user roles

