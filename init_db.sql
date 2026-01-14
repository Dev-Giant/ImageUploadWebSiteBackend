CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unified user profile details (one-to-one with users, works for all roles)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Name fields (different forms use different names)
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  -- Personal info
  date_of_birth DATE,
  gender TEXT,
  -- Contact info
  phone_country_code TEXT,
  phone_number TEXT,
  mobile_number TEXT,
  area_code TEXT,
  -- Address fields
  postal_code TEXT,
  country TEXT,
  state TEXT,
  state_region TEXT,
  city TEXT,
  street TEXT,
  -- Professional info (for admin/advertiser)
  position TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  filename TEXT,
  platform TEXT,
  tag_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS draws (
  id SERIAL PRIMARY KEY,
  name TEXT,
  country TEXT,
  city TEXT,
  wave TEXT,
  next_number INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  draw_id INTEGER REFERENCES draws(id),
  entry_number TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
-- Static pages
CREATE TABLE IF NOT EXISTS static_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billboards (
  id SERIAL PRIMARY KEY,
  advertiser_id INTEGER REFERENCES users(id),
  advertiser_name TEXT,
  postal_code TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ads
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_path TEXT,
  link TEXT,
  platform TEXT,
  placement TEXT,
  region TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns (for advertisers)
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  advertiser_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  region TEXT,
  budget DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices (for advertisers)
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  advertiser_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update uploads table to include billboard_id if needed
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS billboard_id INTEGER REFERENCES billboards(id);

-- Ad Placements System Tables
-- 1. Platforms Table (Social Media Platforms)
CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platforms_name ON platforms(name);

-- 2. Placements Table (Ad Positions on Each Platform)
CREATE TABLE IF NOT EXISTS placements (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  placement_type VARCHAR(20) NOT NULL CHECK (placement_type IN ('medium_rectangle', 'leaderboard', 'skyscraper')),
  position_name VARCHAR(100) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'booked')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform_id, position_name)
);

CREATE INDEX IF NOT EXISTS idx_placements_platform ON placements(platform_id);
CREATE INDEX IF NOT EXISTS idx_placements_availability ON placements(availability_status);

-- 3. Bookings Table (Advertiser Ad Bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  advertiser_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  placement_id INTEGER NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  campaign_name VARCHAR(200) NOT NULL,
  ad_image_url VARCHAR(500),
  ad_link_url VARCHAR(500),
  region VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_advertiser ON bookings(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_bookings_placement ON bookings(placement_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_active ON bookings(status, start_date, end_date);

-- 4. Regional Pricing Table (Pricing Multipliers by Region)
CREATE TABLE IF NOT EXISTS regional_pricing (
  id SERIAL PRIMARY KEY,
  region_name VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL,
  state VARCHAR(50),
  price_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regional_pricing_region ON regional_pricing(region_name);

CREATE INDEX IF NOT EXISTS idx_regional_pricing_location ON regional_pricing(country, state);

CREATE UNIQUE INDEX IF NOT EXISTS idx_regional_pricing_unique ON regional_pricing(region_name, country, state);

-- Add comments to ad placements tables
COMMENT ON TABLE platforms IS 'Social media platforms for ad placements';
COMMENT ON TABLE placements IS 'Available advertising positions on each platform';
COMMENT ON TABLE bookings IS 'Advertiser bookings for ad placements';
COMMENT ON TABLE regional_pricing IS 'Regional pricing multipliers for different markets';
