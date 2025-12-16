-- Ad Placements System Tables

-- Ad placement types and positions
CREATE TABLE IF NOT EXISTS ad_placement_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default ad placement types
INSERT INTO ad_placement_types (name, description, width, height) VALUES
('leaderboard', 'Leaderboard banner ad (728x90)', 728, 90),
('skyscraper', 'Skyscraper vertical ad (160x600)', 160, 600),
('medium_rectangle', 'Medium rectangle ad (300x250)', 300, 250),
('large_rectangle', 'Large rectangle ad (336x280)', 336, 280)
ON CONFLICT (name) DO NOTHING;

-- Social media platforms
CREATE TABLE IF NOT EXISTS social_platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert social media platforms
INSERT INTO social_platforms (name, display_name) VALUES
('facebook', 'Facebook'),
('instagram', 'Instagram'),
('x', 'X (Twitter)'),
('snapchat', 'Snapchat'),
('tiktok', 'TikTok'),
('youtube', 'YouTube'),
('telegram', 'Telegram'),
('pinterest', 'Pinterest'),
('reddit', 'Reddit'),
('wechat', 'WeChat'),
('weibo', 'Weibo'),
('kuaishou', 'Kuaishou'),
('douyin', 'Douyin'),
('linkedin', 'LinkedIn')
ON CONFLICT (name) DO NOTHING;

-- Ad placement positions on each social media page
CREATE TABLE IF NOT EXISTS ad_placements (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER REFERENCES social_platforms(id),
  placement_type_id INTEGER REFERENCES ad_placement_types(id),
  position_name VARCHAR(100) NOT NULL, -- e.g., 'leaderboard_1', 'skyscraper_left'
  position_order INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL, -- Base price per month
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform_id, position_name)
);

-- Create ad placements for each platform (4 positions: 2 leaderboard, 2 skyscraper)
-- We'll insert these programmatically

-- Ad bookings/purchases
CREATE TABLE IF NOT EXISTS ad_bookings (
  id SERIAL PRIMARY KEY,
  advertiser_id INTEGER REFERENCES users(id),
  placement_id INTEGER REFERENCES ad_placements(id),
  campaign_name VARCHAR(200) NOT NULL,
  ad_image_url TEXT,
  ad_link_url TEXT,
  region VARCHAR(100) NOT NULL, -- 30-mile radius region
  postal_code VARCHAR(20),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, active, paused, completed
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Regional pricing multipliers
CREATE TABLE IF NOT EXISTS regional_pricing (
  id SERIAL PRIMARY KEY,
  region_name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code_prefix VARCHAR(10),
  price_multiplier DECIMAL(4, 2) DEFAULT 1.00, -- 1.00 = base price, 1.5 = 50% more expensive
  population_density VARCHAR(50), -- low, medium, high, very_high
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(region_name, country)
);

-- Insert some sample regional pricing
INSERT INTO regional_pricing (region_name, country, state_province, price_multiplier, population_density) VALUES
('Los Angeles Metro', 'United States', 'California', 1.8, 'very_high'),
('New York Metro', 'United States', 'New York', 2.0, 'very_high'),
('San Francisco Bay Area', 'United States', 'California', 1.9, 'very_high'),
('Chicago Metro', 'United States', 'Illinois', 1.4, 'high'),
('Dallas-Fort Worth', 'United States', 'Texas', 1.3, 'high'),
('Miami Metro', 'United States', 'Florida', 1.2, 'medium'),
('London', 'United Kingdom', 'England', 2.2, 'very_high'),
('Toronto', 'Canada', 'Ontario', 1.6, 'high'),
('Sydney', 'Australia', 'New South Wales', 1.7, 'high')
ON CONFLICT (region_name, country) DO NOTHING;