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

async function addUploadTypeColumn() {
  try {
    console.log('🔄 Adding upload_type column to uploads table...');
    
    // Add upload_type column if it doesn't exist
    await pool.query(`
      ALTER TABLE uploads 
      ADD COLUMN IF NOT EXISTS upload_type VARCHAR(20) DEFAULT 'user';
    `);
    
    // Add index for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_type ON uploads(upload_type);
    `);
    
    // Update existing uploads to be 'user' type (they are user sweepstake uploads)
    await pool.query(`
      UPDATE uploads 
      SET upload_type = 'user' 
      WHERE upload_type IS NULL;
    `);
    
    console.log('✅ upload_type column added successfully!');
    console.log('   - Default value: "user" (for sweepstake uploads)');
    console.log('   - Advertiser media will use: "advertiser"');
    
  } catch (err) {
    console.error('❌ Failed to add upload_type column:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addUploadTypeColumn();

