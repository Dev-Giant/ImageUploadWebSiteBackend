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
