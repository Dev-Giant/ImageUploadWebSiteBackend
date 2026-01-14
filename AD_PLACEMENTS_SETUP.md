# Ad Placements System - Setup Instructions

## Prerequisites

- PostgreSQL database running
- Node.js backend server configured
- Database connection configured in `.env` file

---

## ✨ Quick Setup (One Command!)

The Ad Placements system is now fully integrated into the database initialization script. Everything is set up automatically when you run:

```bash
cd ImageUploadWebSiteBackend
npm run init-db
```

This single command will:
1. ✅ Create all database tables (including ad placements tables)
2. ✅ Seed 14 social media platforms
3. ✅ Seed 112 ad placements (8 per platform)
4. ✅ Seed 26 regional pricing entries

---

## What Gets Created

### Database Tables (4 new tables)
- `platforms` - Social media platforms
- `placements` - Ad positions on each platform
- `bookings` - Advertiser bookings
- `regional_pricing` - Regional pricing multipliers

### Initial Data
- **14 platforms** (Facebook, Instagram, YouTube, WeChat, Twitter/X, LinkedIn, TikTok, Pinterest, Snapchat, Reddit, WhatsApp, Telegram, Tumblr, Discord)
- **112 placements** (8 per platform: 4 Medium Rectangles, 2 Leaderboards, 2 Skyscrapers)
- **26 regional pricing entries** (major metro areas with pricing multipliers)

---

## Verification

After running `npm run init-db`, verify the setup:

```sql
-- Check platforms
SELECT COUNT(*) FROM platforms;  -- Should be 14

-- Check placements
SELECT COUNT(*) FROM placements;  -- Should be 112

-- Check regional pricing
SELECT COUNT(*) FROM regional_pricing;  -- Should be 26

-- View platforms
SELECT * FROM platforms;

-- View sample placements
SELECT * FROM placements LIMIT 10;
```

---

## Testing the API

Once the database is initialized, start your backend server and test:

```bash
# Start backend
npm run dev

# Test platforms endpoint
curl http://localhost:4000/api/ad-placements/platforms

# Test placements endpoint
curl http://localhost:4000/api/ad-placements/platforms/facebook/placements

# Test regional pricing
curl http://localhost:4000/api/ad-placements/regional-pricing
```

---

## Database Schema Overview

### Platforms Table
```sql
id, name, display_name, created_at, updated_at
```

### Placements Table
```sql
id, platform_id, placement_type, position_name, width, height, 
base_price, description, availability_status, created_at, updated_at
```

### Bookings Table
```sql
id, advertiser_id, placement_id, campaign_name, ad_image_url, ad_link_url,
region, postal_code, start_date, end_date, monthly_price, total_price,
status, impressions, clicks, created_at, updated_at
```

### Regional Pricing Table
```sql
id, region_name, country, state, price_multiplier, description,
created_at, updated_at
```

---

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/ad-placements/platforms/:platform/active-ads` - Get active ads for a platform
- `POST /api/ad-placements/track/impression` - Track ad impression
- `POST /api/ad-placements/track/click` - Track ad click

### Protected Endpoints (Auth Required)
- `GET /api/ad-placements/platforms` - Get all platforms
- `GET /api/ad-placements/platforms/:platform/placements` - Get placements for platform
- `GET /api/ad-placements/regional-pricing` - Get regional pricing
- `POST /api/ad-placements/calculate-pricing` - Calculate pricing
- `POST /api/ad-placements/bookings` - Create booking
- `GET /api/ad-placements/bookings` - Get user's bookings

### Admin-Only Endpoints
- `PUT /api/ad-placements/bookings/:id/status` - Update booking status

---

## Placement Types & Pricing

### Medium Rectangle (300x250)
- 4 positions per platform
- Base price: $400-$500/month
- Best for: Product showcases, brand awareness

### Leaderboard (728x90)
- 2 positions per platform
- Base price: $700-$800/month
- Best for: High visibility, top/bottom banners

### Skyscraper (160x600)
- 2 positions per platform
- Base price: $600/month
- Best for: Persistent sidebar presence

---

## Regional Pricing Multipliers

### Premium Markets (1.8x - 2.0x)
- New York Metro: 2.0x
- San Francisco Bay Area: 1.9x
- Los Angeles Metro: 1.8x
- London Metro: 1.9x

### Major Markets (1.4x - 1.6x)
- Sydney Metro: 1.6x
- Toronto Metro: 1.5x
- Chicago Metro: 1.5x
- Miami Metro: 1.4x

### Standard Markets (1.0x - 1.3x)
- All other markets: 1.0x - 1.3x

---

## Booking Status Flow

1. **pending** - Initial booking request
2. **approved** - Admin approved the booking
3. **active** - Campaign is currently running
4. **completed** - Campaign has ended
5. **cancelled** - Booking was cancelled

---

## Troubleshooting

### Issue: Tables already exist
**Solution**: Drop existing tables first:
```sql
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS placements;
DROP TABLE IF EXISTS regional_pricing;
DROP TABLE IF EXISTS platforms;
```

### Issue: Foreign key constraint fails
**Solution**: Ensure `users` table exists before running migration

### Issue: Seeding fails
**Solution**: Check database connection in `src/config/database.js`

### Issue: API returns 404
**Solution**: Verify routes are registered in main app file

---

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Create test bookings
3. ✅ Verify frontend integration
4. ✅ Set up admin approval workflow
5. ✅ Implement payment processing
6. ✅ Add analytics tracking
7. ✅ Deploy to production

---

## Support

For issues or questions:
1. Check the logs: `console.log` statements in controllers
2. Verify database connection
3. Test API endpoints with Postman/curl
4. Check frontend console for errors
