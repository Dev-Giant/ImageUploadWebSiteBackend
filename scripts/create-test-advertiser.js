import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function createTestAdvertiser() {
  try {
    console.log('🔄 Creating test advertiser account...');
    
    const email = 'test@advertiser.com';
    const password = 'password123';
    const role = 'advertiser';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Test advertiser already exists!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      return;
    }
    
    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );
    
    const newUser = userResult.rows[0];
    
    // Create profile
    await pool.query(
      `INSERT INTO user_profiles (
        user_id, first_name, last_name, company, position, 
        postal_code, country, state, city, phone_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newUser.id,
        'Test',
        'Advertiser',
        'Test Company Inc.',
        'Marketing Manager',
        '90210',
        'USA',
        'California',
        'Los Angeles',
        '+1-555-0123'
      ]
    );
    
    console.log('✅ Test advertiser created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   User ID: ${newUser.id}`);
    
  } catch (err) {
    console.error('❌ Failed to create test advertiser:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTestAdvertiser();