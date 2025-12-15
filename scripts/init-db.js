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
    console.log('   - advertiser_profiles');
    console.log('   - uploads');
    console.log('   - draws');
    console.log('   - entries');
    console.log('   - static_pages');
    console.log('   - billboards');
    console.log('   - ads');
    console.log('   - campaigns');
    console.log('   - invoices');
    
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

