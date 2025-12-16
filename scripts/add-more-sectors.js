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

async function addMoreSectors() {
  try {
    console.log('🔄 Adding more diverse sector data...');
    
    // Create more advertisers with different sectors
    const newAdvertisers = [
      {
        email: 'tech@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Tech',
          last_name: 'Innovator',
          company: 'TechCorp Solutions',
          position: 'CTO',
          postal_code: '94102',
          country: 'USA',
          state: 'California',
          city: 'San Francisco'
        }
      },
      {
        email: 'healthcare@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Health',
          last_name: 'Provider',
          company: 'MediCare Plus',
          position: 'Marketing Director',
          postal_code: '60601',
          country: 'USA',
          state: 'Illinois',
          city: 'Chicago'
        }
      },
      {
        email: 'finance@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Finance',
          last_name: 'Expert',
          company: 'Global Finance Group',
          position: 'VP Marketing',
          postal_code: '10005',
          country: 'USA',
          state: 'New York',
          city: 'New York'
        }
      },
      {
        email: 'retail@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Retail',
          last_name: 'Manager',
          company: 'MegaStore Chain',
          position: 'Brand Manager',
          postal_code: '33101',
          country: 'USA',
          state: 'Florida',
          city: 'Miami'
        }
      }
    ];

    // Create new advertisers
    const newAdvertiserIds = [];
    for (const advertiser of newAdvertisers) {
      const userResult = await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        [advertiser.email, advertiser.password, advertiser.role]
      );
      
      const newUserId = userResult.rows[0].id;
      newAdvertiserIds.push(newUserId);
      
      await pool.query(
        `INSERT INTO user_profiles (
          user_id, first_name, last_name, company, position, 
          postal_code, country, state, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newUserId,
          advertiser.profile.first_name,
          advertiser.profile.last_name,
          advertiser.profile.company,
          advertiser.profile.position,
          advertiser.profile.postal_code,
          advertiser.profile.country,
          advertiser.profile.state,
          advertiser.profile.city
        ]
      );
    }

    // Create billboards for new sectors
    const newBillboards = [
      {
        advertiser_id: newAdvertiserIds[0],
        advertiser_name: 'TechCorp Solutions',
        postal_code: '94102',
        active: true,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        advertiser_id: newAdvertiserIds[1],
        advertiser_name: 'MediCare Plus',
        postal_code: '60601',
        active: true,
        created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
      },
      {
        advertiser_id: newAdvertiserIds[2],
        advertiser_name: 'Global Finance Group',
        postal_code: '10005',
        active: true,
        created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago (old)
      },
      {
        advertiser_id: newAdvertiserIds[3],
        advertiser_name: 'MegaStore Chain',
        postal_code: '33101',
        active: true,
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 180 days ago (old)
      }
    ];

    for (const billboard of newBillboards) {
      await pool.query(
        'INSERT INTO billboards (advertiser_id, advertiser_name, postal_code, active, created_at) VALUES ($1, $2, $3, $4, $5)',
        [billboard.advertiser_id, billboard.advertiser_name, billboard.postal_code, billboard.active, billboard.created_at]
      );
    }
    
    console.log('✅ Added more sector data successfully!');
    console.log(`   - ${newAdvertisers.length} new advertisers`);
    console.log(`   - ${newBillboards.length} new billboards`);
    console.log('   - Sectors: Technology, Healthcare, Finance, Retail');
    
  } catch (err) {
    console.error('❌ Failed to add sector data:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addMoreSectors();