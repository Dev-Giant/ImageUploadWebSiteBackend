import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function setupAdPlacements() {
  try {
    console.log('🔄 Setting up ad placements system...');
    
    // Create tables directly
    const createTablesSQL = [
      `CREATE TABLE IF NOT EXISTS ad_placement_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `INSERT INTO ad_placement_types (name, description, width, height) VALUES
       ('leaderboard', 'Leaderboard banner ad (728x90)', 728, 90),
       ('skyscraper', 'Skyscraper vertical ad (160x600)', 160, 600),
       ('medium_rectangle', 'Medium rectangle ad (300x250)', 300, 250),
       ('large_rectangle', 'Large rectangle ad (336x280)', 336, 280)
       ON CONFLICT (name) DO NOTHING`,
      
      `CREATE TABLE IF NOT EXISTS social_platforms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `INSERT INTO social_platforms (name, display_name) VALUES
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
       ON CONFLICT (name) DO NOTHING`,
      
      `CREATE TABLE IF NOT EXISTS ad_placements (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES social_platforms(id),
        placement_type_id INTEGER REFERENCES ad_placement_types(id),
        position_name VARCHAR(100) NOT NULL,
        position_order INTEGER NOT NULL,
        base_price DECIMAL(10, 2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(platform_id, position_name)
      )`,
      
      `CREATE TABLE IF NOT EXISTS ad_bookings (
        id SERIAL PRIMARY KEY,
        advertiser_id INTEGER REFERENCES users(id),
        placement_id INTEGER REFERENCES ad_placements(id),
        campaign_name VARCHAR(200) NOT NULL,
        ad_image_url TEXT,
        ad_link_url TEXT,
        region VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        monthly_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS regional_pricing (
        id SERIAL PRIMARY KEY,
        region_name VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        state_province VARCHAR(100),
        postal_code_prefix VARCHAR(10),
        price_multiplier DECIMAL(4, 2) DEFAULT 1.00,
        population_density VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(region_name, country)
      )`,
      
      `INSERT INTO regional_pricing (region_name, country, state_province, price_multiplier, population_density) VALUES
       ('Los Angeles Metro', 'United States', 'California', 1.8, 'very_high'),
       ('New York Metro', 'United States', 'New York', 2.0, 'very_high'),
       ('San Francisco Bay Area', 'United States', 'California', 1.9, 'very_high'),
       ('Chicago Metro', 'United States', 'Illinois', 1.4, 'high'),
       ('Dallas-Fort Worth', 'United States', 'Texas', 1.3, 'high'),
       ('Miami Metro', 'United States', 'Florida', 1.2, 'medium'),
       ('London', 'United Kingdom', 'England', 2.2, 'very_high'),
       ('Toronto', 'Canada', 'Ontario', 1.6, 'high'),
       ('Sydney', 'Australia', 'New South Wales', 1.7, 'high')
       ON CONFLICT (region_name, country) DO NOTHING`
    ];
    
    console.log(`📝 Executing ${createTablesSQL.length} SQL statements...`);
    
    for (let i = 0; i < createTablesSQL.length; i++) {
      try {
        await pool.query(createTablesSQL[i]);
        console.log(`✅ Executed statement ${i + 1}/${createTablesSQL.length}`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, err.message);
          throw err;
        }
      }
    }
    
    // Now create ad placements for each platform
    console.log('\n🔄 Creating ad placements for each platform...');
    
    // Get all platforms
    const platformsResult = await pool.query('SELECT id, name FROM social_platforms WHERE active = true');
    const platforms = platformsResult.rows;
    
    // Get placement types
    const typesResult = await pool.query('SELECT id, name FROM ad_placement_types');
    const types = typesResult.rows;
    
    const leaderboardType = types.find(t => t.name === 'leaderboard');
    const skyscraperType = types.find(t => t.name === 'skyscraper');
    const mediumRectangleType = types.find(t => t.name === 'medium_rectangle');
    
    for (const platform of platforms) {
      let positionOrder = 1;
      
      // Create 4 medium rectangle positions (as per requirements)
      for (let i = 1; i <= 4; i++) {
        await pool.query(
          `INSERT INTO ad_placements (platform_id, placement_type_id, position_name, position_order, base_price)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (platform_id, position_name) DO NOTHING`,
          [platform.id, mediumRectangleType.id, `medium_rectangle_${i}`, positionOrder++, 100.00]
        );
      }
      
      // Create 2 leaderboard positions
      for (let i = 1; i <= 2; i++) {
        await pool.query(
          `INSERT INTO ad_placements (platform_id, placement_type_id, position_name, position_order, base_price)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (platform_id, position_name) DO NOTHING`,
          [platform.id, leaderboardType.id, `leaderboard_${i}`, positionOrder++, 150.00]
        );
      }
      
      // Create 2 skyscraper positions
      for (let i = 1; i <= 2; i++) {
        await pool.query(
          `INSERT INTO ad_placements (platform_id, placement_type_id, position_name, position_order, base_price)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (platform_id, position_name) DO NOTHING`,
          [platform.id, skyscraperType.id, `skyscraper_${i}`, positionOrder++, 120.00]
        );
      }
      
      console.log(`✅ Created ad placements for ${platform.name}`);
    }
    
    console.log('\n✅ Ad placements system setup completed!');
    console.log('📊 Summary:');
    console.log(`   - ${platforms.length} social media platforms`);
    console.log(`   - 8 ad positions per platform (4 medium rectangles + 2 leaderboard + 2 skyscraper)`);
    console.log(`   - ${platforms.length * 8} total ad placements created`);
    console.log('   - Regional pricing system configured');
    
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAdPlacements();