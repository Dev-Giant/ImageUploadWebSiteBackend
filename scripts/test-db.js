import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function testDatabase() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('   Current time:', result.rows[0].now);
    
    // Test users table
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`   Users count: ${usersResult.rows[0].count}`);
    
    // Test advertiser
    const advertiserResult = await pool.query('SELECT id, email, role FROM users WHERE email = $1', ['test@advertiser.com']);
    if (advertiserResult.rows.length > 0) {
      console.log('✅ Test advertiser found:', advertiserResult.rows[0]);
      
      // Test campaigns for this advertiser
      const campaignsResult = await pool.query('SELECT COUNT(*) FROM campaigns WHERE advertiser_id = $1', [advertiserResult.rows[0].id]);
      console.log(`   Campaigns count: ${campaignsResult.rows[0].count}`);
    } else {
      console.log('❌ Test advertiser not found');
    }
    
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();