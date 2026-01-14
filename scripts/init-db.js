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

// Ad Placements Seeding Data
const platforms = [
  { name: 'facebook', display_name: 'Facebook' },
  { name: 'instagram', display_name: 'Instagram' },
  { name: 'youtube', display_name: 'YouTube' },
  { name: 'wechat', display_name: 'WeChat' },
  { name: 'twitter', display_name: 'Twitter/X' },
  { name: 'linkedin', display_name: 'LinkedIn' },
  { name: 'tiktok', display_name: 'TikTok' },
  { name: 'pinterest', display_name: 'Pinterest' },
  { name: 'snapchat', display_name: 'Snapchat' },
  { name: 'reddit', display_name: 'Reddit' },
  { name: 'whatsapp', display_name: 'WhatsApp' },
  { name: 'telegram', display_name: 'Telegram' },
  { name: 'tumblr', display_name: 'Tumblr' },
  { name: 'discord', display_name: 'Discord' }
];

const placementTypes = [
  { type: 'medium_rectangle', name: 'medium_rectangle_1', width: 300, height: 250, price: 500, desc: 'Medium Rectangle - Top Position' },
  { type: 'medium_rectangle', name: 'medium_rectangle_2', width: 300, height: 250, price: 450, desc: 'Medium Rectangle - Middle Position' },
  { type: 'medium_rectangle', name: 'medium_rectangle_3', width: 300, height: 250, price: 400, desc: 'Medium Rectangle - Sidebar Position' },
  { type: 'medium_rectangle', name: 'medium_rectangle_4', width: 300, height: 250, price: 400, desc: 'Medium Rectangle - Bottom Position' },
  { type: 'leaderboard', name: 'leaderboard_top', width: 728, height: 90, price: 800, desc: 'Leaderboard - Top Banner' },
  { type: 'leaderboard', name: 'leaderboard_bottom', width: 728, height: 90, price: 700, desc: 'Leaderboard - Bottom Banner' },
  { type: 'skyscraper', name: 'skyscraper_left', width: 160, height: 600, price: 600, desc: 'Skyscraper - Left Sidebar' },
  { type: 'skyscraper', name: 'skyscraper_right', width: 160, height: 600, price: 600, desc: 'Skyscraper - Right Sidebar' }
];

const regionalPricing = [
  { region: 'Los Angeles Metro', country: 'US', state: 'CA', multiplier: 1.80, desc: 'Greater Los Angeles area including Orange County' },
  { region: 'New York Metro', country: 'US', state: 'NY', multiplier: 2.00, desc: 'New York City and surrounding areas' },
  { region: 'San Francisco Bay Area', country: 'US', state: 'CA', multiplier: 1.90, desc: 'San Francisco, Oakland, San Jose metro area' },
  { region: 'Chicago Metro', country: 'US', state: 'IL', multiplier: 1.50, desc: 'Chicago and surrounding suburbs' },
  { region: 'Miami Metro', country: 'US', state: 'FL', multiplier: 1.40, desc: 'Miami-Fort Lauderdale-West Palm Beach' },
  { region: 'Dallas-Fort Worth', country: 'US', state: 'TX', multiplier: 1.30, desc: 'Dallas-Fort Worth metroplex' },
  { region: 'Houston Metro', country: 'US', state: 'TX', multiplier: 1.30, desc: 'Greater Houston area' },
  { region: 'San Diego Metro', country: 'US', state: 'CA', multiplier: 1.40, desc: 'San Diego County' },
  { region: 'Austin Metro', country: 'US', state: 'TX', multiplier: 1.25, desc: 'Austin and surrounding areas' },
  { region: 'Seattle Metro', country: 'US', state: 'WA', multiplier: 1.35, desc: 'Seattle-Tacoma-Bellevue' },
  { region: 'Denver Metro', country: 'US', state: 'CO', multiplier: 1.20, desc: 'Denver and surrounding areas' },
  { region: 'Phoenix Metro', country: 'US', state: 'AZ', multiplier: 1.15, desc: 'Greater Phoenix area' },
  { region: 'Sydney Metro', country: 'AU', state: 'NSW', multiplier: 1.60, desc: 'Greater Sydney area' },
  { region: 'Melbourne Metro', country: 'AU', state: 'VIC', multiplier: 1.50, desc: 'Greater Melbourne area' },
  { region: 'Brisbane Metro', country: 'AU', state: 'QLD', multiplier: 1.30, desc: 'Greater Brisbane area' },
  { region: 'Perth Metro', country: 'AU', state: 'WA', multiplier: 1.20, desc: 'Greater Perth area' },
  { region: 'London Metro', country: 'GB', state: 'ENG', multiplier: 1.90, desc: 'Greater London area' },
  { region: 'Manchester Metro', country: 'GB', state: 'ENG', multiplier: 1.40, desc: 'Greater Manchester area' },
  { region: 'Birmingham Metro', country: 'GB', state: 'ENG', multiplier: 1.30, desc: 'Birmingham and West Midlands' },
  { region: 'Toronto Metro', country: 'CA', state: 'ON', multiplier: 1.50, desc: 'Greater Toronto Area' },
  { region: 'Vancouver Metro', country: 'CA', state: 'BC', multiplier: 1.45, desc: 'Greater Vancouver area' },
  { region: 'Montreal Metro', country: 'CA', state: 'QC', multiplier: 1.35, desc: 'Greater Montreal area' },
  { region: 'Other US Markets', country: 'US', state: '', multiplier: 1.00, desc: 'All other US markets' },
  { region: 'Other AU Markets', country: 'AU', state: '', multiplier: 1.00, desc: 'All other Australian markets' },
  { region: 'Other UK Markets', country: 'GB', state: '', multiplier: 1.00, desc: 'All other UK markets' },
  { region: 'Other CA Markets', country: 'CA', state: '', multiplier: 1.00, desc: 'All other Canadian markets' }
];

async function seedAdPlacements(pool) {
  try {
    // Check if data already exists
    const checkResult = await pool.query('SELECT COUNT(*) FROM platforms');
    const count = parseInt(checkResult.rows[0].count);
    
    if (count > 0) {
      console.log('   ⚠️  Ad placements data already exists, skipping seeding');
      return;
    }
    
    console.log('   📱 Seeding platforms...');
    const platformIds = {};
    
    for (const platform of platforms) {
      const result = await pool.query(
        'INSERT INTO platforms (name, display_name) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id',
        [platform.name, platform.display_name]
      );
      platformIds[platform.name] = result.rows[0].id;
    }
    
    console.log(`   ✅ Seeded ${platforms.length} platforms`);
    
    console.log('   🎯 Seeding placements...');
    let totalPlacements = 0;
    
    for (const [platformName, platformId] of Object.entries(platformIds)) {
      for (const placement of placementTypes) {
        await pool.query(
          `INSERT INTO placements (platform_id, placement_type, position_name, width, height, base_price, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (platform_id, position_name) DO UPDATE SET
             width = EXCLUDED.width,
             height = EXCLUDED.height,
             base_price = EXCLUDED.base_price,
             description = EXCLUDED.description`,
          [platformId, placement.type, placement.name, placement.width, placement.height, placement.price, placement.desc]
        );
        totalPlacements++;
      }
    }
    
    console.log(`   ✅ Seeded ${totalPlacements} placements (${placementTypes.length} per platform)`);
    
    console.log('   💰 Seeding regional pricing...');
    
    for (const pricing of regionalPricing) {
      // Use empty string for null state values
      const stateValue = pricing.state || '';
      
      // Check if entry exists
      const checkQuery = `
        SELECT id FROM regional_pricing 
        WHERE region_name = $1 AND country = $2 AND state = $3
      `;
      const existing = await pool.query(checkQuery, [pricing.region, pricing.country, stateValue]);
      
      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(
          `UPDATE regional_pricing 
           SET price_multiplier = $1, description = $2
           WHERE id = $3`,
          [pricing.multiplier, pricing.desc, existing.rows[0].id]
        );
      } else {
        // Insert new
        await pool.query(
          `INSERT INTO regional_pricing (region_name, country, state, price_multiplier, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [pricing.region, pricing.country, stateValue, pricing.multiplier, pricing.desc]
        );
      }
    }
    
    console.log(`   ✅ Seeded ${regionalPricing.length} regional pricing entries`);
    console.log('\n🎉 Ad placements seeding completed successfully!');
    
  } catch (error) {
    console.error('   ❌ Error seeding ad placements:', error.message);
    throw error;
  }
}

async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'init_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Strip single-line comments that start with `--`
    const sqlNoComments = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split by semicolons and execute each statement
    const statements = sqlNoComments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await pool.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (err) {
          // Ignore "already exists" errors for IF NOT EXISTS statements
          if (err.message.includes('already exists') || err.message.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, err.message);
            throw err;
          }
        }
      }
    }
    
    console.log('✅ Database initialized successfully!');
    console.log('\n📊 Tables created:');
    console.log('   - users');
    console.log('   - user_profiles');
    console.log('   - uploads');
    console.log('   - draws');
    console.log('   - entries');
    console.log('   - static_pages');
    console.log('   - billboards');
    console.log('   - ads');
    console.log('   - campaigns');
    console.log('   - invoices');
    console.log('   - platforms');
    console.log('   - placements');
    console.log('   - bookings');
    console.log('   - regional_pricing');
    
    // Seed ad placements data
    console.log('\n🌱 Seeding ad placements data...');
    await seedAdPlacements(pool);
    
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    if (err.code === '28P01') {
      console.error('   → Check your DB_USER and DB_PASSWORD in .env file');
    } else if (err.code === '3D000') {
      console.error('   → Database does not exist. Please create it first:');
      console.error('     CREATE DATABASE gotta_scan_db;');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   → Cannot connect to PostgreSQL. Make sure it is running.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();

