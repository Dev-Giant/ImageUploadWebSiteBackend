import db from '../src/config/database.js';

// 14 Social Media Platforms
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

// Placement configurations
const placementTypes = [
  // 4 Medium Rectangles
  { type: 'medium_rectangle', name: 'medium_rectangle_1', width: 300, height: 250, price: 500, desc: 'Medium Rectangle - Top Position' },
  { type: 'medium_rectangle', name: 'medium_rectangle_2', width: 300, height: 250, price: 450, desc: 'Medium Rectangle - Middle Position' },
  { type: 'medium_rectangle', name: 'medium_rectangle_3', width: 300, height: 250, price: 400, desc: 'Medium Rectangle - Sidebar Position' },
  { type: 'medium_rectangle', name: 'medium_rectangle_4', width: 300, height: 250, price: 400, desc: 'Medium Rectangle - Bottom Position' },
  
  // 2 Leaderboards
  { type: 'leaderboard', name: 'leaderboard_top', width: 728, height: 90, price: 800, desc: 'Leaderboard - Top Banner' },
  { type: 'leaderboard', name: 'leaderboard_bottom', width: 728, height: 90, price: 700, desc: 'Leaderboard - Bottom Banner' },
  
  // 2 Skyscrapers
  { type: 'skyscraper', name: 'skyscraper_left', width: 160, height: 600, price: 600, desc: 'Skyscraper - Left Sidebar' },
  { type: 'skyscraper', name: 'skyscraper_right', width: 160, height: 600, price: 600, desc: 'Skyscraper - Right Sidebar' }
];

// Regional pricing data
const regionalPricing = [
  // United States - Major Metro Areas
  { region: 'Los Angeles Metro', country: 'US', state: 'CA', multiplier: 1.80, desc: 'Greater Los Angeles area including Orange County' },
  { region: 'New York Metro', country: 'US', state: 'NY', multiplier: 2.00, desc: 'New York City and surrounding areas' },
  { region: 'San Francisco Bay Area', country: 'US', state: 'CA', multiplier: 1.90, desc: 'San Francisco, Oakland, San Jose metro area' },
  { region: 'Chicago Metro', country: 'US', state: 'IL', multiplier: 1.50, desc: 'Chicago and surrounding suburbs' },
  { region: 'Miami Metro', country: 'US', state: 'FL', multiplier: 1.40, desc: 'Miami-Fort Lauderdale-West Palm Beach' },
  { region: 'Dallas-Fort Worth', country: 'US', state: 'TX', multiplier: 1.30, desc: 'Dallas-Fort Worth metroplex' },
  { region: 'Houston Metro', country: 'US', state: 'TX', multiplier: 1.30, desc: 'Greater Houston area' },
  { region: 'San Diego Metro', country: 'US', state: 'CA', multiplier: 1.40, desc: 'San Diego County' },
  
  // United States - Mid-Size Cities
  { region: 'Austin Metro', country: 'US', state: 'TX', multiplier: 1.25, desc: 'Austin and surrounding areas' },
  { region: 'Seattle Metro', country: 'US', state: 'WA', multiplier: 1.35, desc: 'Seattle-Tacoma-Bellevue' },
  { region: 'Denver Metro', country: 'US', state: 'CO', multiplier: 1.20, desc: 'Denver and surrounding areas' },
  { region: 'Phoenix Metro', country: 'US', state: 'AZ', multiplier: 1.15, desc: 'Greater Phoenix area' },
  
  // Australia
  { region: 'Sydney Metro', country: 'AU', state: 'NSW', multiplier: 1.60, desc: 'Greater Sydney area' },
  { region: 'Melbourne Metro', country: 'AU', state: 'VIC', multiplier: 1.50, desc: 'Greater Melbourne area' },
  { region: 'Brisbane Metro', country: 'AU', state: 'QLD', multiplier: 1.30, desc: 'Greater Brisbane area' },
  { region: 'Perth Metro', country: 'AU', state: 'WA', multiplier: 1.20, desc: 'Greater Perth area' },
  
  // United Kingdom
  { region: 'London Metro', country: 'GB', state: 'ENG', multiplier: 1.90, desc: 'Greater London area' },
  { region: 'Manchester Metro', country: 'GB', state: 'ENG', multiplier: 1.40, desc: 'Greater Manchester area' },
  { region: 'Birmingham Metro', country: 'GB', state: 'ENG', multiplier: 1.30, desc: 'Birmingham and West Midlands' },
  
  // Canada
  { region: 'Toronto Metro', country: 'CA', state: 'ON', multiplier: 1.50, desc: 'Greater Toronto Area' },
  { region: 'Vancouver Metro', country: 'CA', state: 'BC', multiplier: 1.45, desc: 'Greater Vancouver area' },
  { region: 'Montreal Metro', country: 'CA', state: 'QC', multiplier: 1.35, desc: 'Greater Montreal area' },
  
  // Default regions (lower multipliers)
  { region: 'Other US Markets', country: 'US', state: null, multiplier: 1.00, desc: 'All other US markets' },
  { region: 'Other AU Markets', country: 'AU', state: null, multiplier: 1.00, desc: 'All other Australian markets' },
  { region: 'Other UK Markets', country: 'GB', state: null, multiplier: 1.00, desc: 'All other UK markets' },
  { region: 'Other CA Markets', country: 'CA', state: null, multiplier: 1.00, desc: 'All other Canadian markets' }
];

async function seedAdPlacements() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('🌱 Starting Ad Placements seeding...\n');
    
    // 1. Seed Platforms
    console.log('📱 Seeding platforms...');
    const platformIds = {};
    
    for (const platform of platforms) {
      const [result] = await connection.query(
        'INSERT INTO platforms (name, display_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)',
        [platform.name, platform.display_name]
      );
      
      // Get the platform ID
      const [rows] = await connection.query('SELECT id FROM platforms WHERE name = ?', [platform.name]);
      platformIds[platform.name] = rows[0].id;
      
      console.log(`  ✓ ${platform.display_name}`);
    }
    
    console.log(`\n✅ Seeded ${platforms.length} platforms\n`);
    
    // 2. Seed Placements (8 per platform = 112 total)
    console.log('🎯 Seeding placements...');
    let totalPlacements = 0;
    
    for (const [platformName, platformId] of Object.entries(platformIds)) {
      for (const placement of placementTypes) {
        await connection.query(
          `INSERT INTO placements (platform_id, placement_type, position_name, width, height, base_price, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             width = VALUES(width),
             height = VALUES(height),
             base_price = VALUES(base_price),
             description = VALUES(description)`,
          [platformId, placement.type, placement.name, placement.width, placement.height, placement.price, placement.desc]
        );
        totalPlacements++;
      }
      console.log(`  ✓ ${platformName}: 8 placements`);
    }
    
    console.log(`\n✅ Seeded ${totalPlacements} placements (${placementTypes.length} per platform)\n`);
    
    // 3. Seed Regional Pricing
    console.log('💰 Seeding regional pricing...');
    
    for (const pricing of regionalPricing) {
      await connection.query(
        `INSERT INTO regional_pricing (region_name, country, state, price_multiplier, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           price_multiplier = VALUES(price_multiplier),
           description = VALUES(description)`,
        [pricing.region, pricing.country, pricing.state, pricing.multiplier, pricing.desc]
      );
      console.log(`  ✓ ${pricing.region} (${pricing.country}): ${pricing.multiplier}x`);
    }
    
    console.log(`\n✅ Seeded ${regionalPricing.length} regional pricing entries\n`);
    
    await connection.commit();
    
    console.log('🎉 Ad Placements seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${platforms.length} platforms`);
    console.log(`   - ${totalPlacements} total placements`);
    console.log(`   - ${regionalPricing.length} regional pricing entries`);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error seeding ad placements:', error);
    throw error;
  } finally {
    connection.release();
    await db.end();
  }
}

// Run the seeding
seedAdPlacements()
  .then(() => {
    console.log('\n✨ Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });
