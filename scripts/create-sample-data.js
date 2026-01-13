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

async function createSampleData() {
  try {
    console.log('🔄 Creating sample data...');
    
    // Get the test advertiser (check both possible emails for compatibility)
    let advertiserResult = await pool.query('SELECT id FROM users WHERE email = $1', ['advertiser@test.com']);
    if (advertiserResult.rows.length === 0) {
      advertiserResult = await pool.query('SELECT id FROM users WHERE email = $1', ['test@advertiser.com']);
    }
    
    if (advertiserResult.rows.length === 0) {
      console.log('❌ Test advertiser not found. Please run create-test-advertiser.js first.');
      console.log('   Note: This script requires the server to be running for API-based advertiser creation.');
      return;
    }
    
    const advertiserId = advertiserResult.rows[0].id;
    
    // Create sample campaigns
    const campaigns = [
      {
        title: 'Summer Sale Campaign',
        region: 'California',
        budget: 5000,
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        status: 'active',
        impressions: 15000,
        clicks: 450,
        conversions: 23
      },
      {
        title: 'Holiday Promotion',
        region: 'New York',
        budget: 8000,
        start_date: '2024-11-01',
        end_date: '2024-12-31',
        status: 'active',
        impressions: 22000,
        clicks: 680,
        conversions: 41
      },
      {
        title: 'Spring Launch',
        region: 'Texas',
        budget: 3500,
        start_date: '2024-03-01',
        end_date: '2024-05-31',
        status: 'paused',
        impressions: 8500,
        clicks: 210,
        conversions: 12
      }
    ];
    
    for (const campaign of campaigns) {
      await pool.query(
        `INSERT INTO campaigns (
          advertiser_id, title, region, budget, start_date, end_date, 
          status, impressions, clicks, conversions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          advertiserId,
          campaign.title,
          campaign.region,
          campaign.budget,
          campaign.start_date,
          campaign.end_date,
          campaign.status,
          campaign.impressions,
          campaign.clicks,
          campaign.conversions
        ]
      );
    }
    
    // Create additional test advertisers for different sectors
    const additionalAdvertisers = [
      {
        email: 'automotive@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Auto',
          last_name: 'Dealer',
          company: 'Premium Auto Group',
          position: 'Marketing Director',
          postal_code: '90210',
          country: 'USA',
          state: 'California',
          city: 'Beverly Hills'
        }
      },
      {
        email: 'fashion@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Fashion',
          last_name: 'Brand',
          company: 'Luxury Fashion Co',
          position: 'Brand Manager',
          postal_code: '10001',
          country: 'USA',
          state: 'New York',
          city: 'New York'
        }
      },
      {
        email: 'restaurant@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        profile: {
          first_name: 'Restaurant',
          last_name: 'Owner',
          company: 'Fine Dining Restaurant',
          position: 'Owner',
          postal_code: '75001',
          country: 'USA',
          state: 'Texas',
          city: 'Dallas'
        }
      }
    ];

    // Create additional advertisers
    for (const advertiser of additionalAdvertisers) {
      const userResult = await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        [advertiser.email, advertiser.password, advertiser.role]
      );
      
      const newUserId = userResult.rows[0].id;
      
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

    // Get all advertiser IDs
    const allAdvertisers = await pool.query('SELECT id FROM users WHERE role = $1', ['advertiser']);
    const advertiserIds = allAdvertisers.rows.map(row => row.id);

    // Create sample billboards with different ages and sectors
    const billboards = [
      // Recent billboards (under 3 months)
      {
        advertiser_id: advertiserIds[0],
        advertiser_name: 'Test Company Inc.',
        postal_code: '90210',
        active: true,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        advertiser_id: advertiserIds[1] || advertiserIds[0],
        advertiser_name: 'Premium Auto Group',
        postal_code: '90210',
        active: true,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
      },
      {
        advertiser_id: advertiserIds[2] || advertiserIds[0],
        advertiser_name: 'Luxury Fashion Co',
        postal_code: '10001',
        active: true,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      },
      // Older billboards (over 3 months)
      {
        advertiser_id: advertiserIds[3] || advertiserIds[0],
        advertiser_name: 'Fine Dining Restaurant',
        postal_code: '75001',
        active: true,
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) // 120 days ago
      },
      {
        advertiser_id: advertiserIds[0],
        advertiser_name: 'Test Company Inc.',
        postal_code: '10001',
        active: true,
        created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000) // 150 days ago
      },
      {
        advertiser_id: advertiserIds[1] || advertiserIds[0],
        advertiser_name: 'Premium Auto Group',
        postal_code: '75001',
        active: false,
        created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) // 200 days ago
      }
    ];
    
    for (const billboard of billboards) {
      await pool.query(
        'INSERT INTO billboards (advertiser_id, advertiser_name, postal_code, active, created_at) VALUES ($1, $2, $3, $4, $5)',
        [billboard.advertiser_id, billboard.advertiser_name, billboard.postal_code, billboard.active, billboard.created_at]
      );
    }
    
    // Create sample invoices
    const invoices = [
      {
        amount: 1250.00,
        status: 'paid',
        due_date: '2024-01-15',
        paid_date: '2024-01-10'
      },
      {
        amount: 2100.00,
        status: 'pending',
        due_date: '2024-02-15',
        paid_date: null
      }
    ];
    
    for (const invoice of invoices) {
      await pool.query(
        'INSERT INTO invoices (advertiser_id, amount, status, due_date, paid_date) VALUES ($1, $2, $3, $4, $5)',
        [advertiserId, invoice.amount, invoice.status, invoice.due_date, invoice.paid_date]
      );
    }
    
    console.log('✅ Sample data created successfully!');
    console.log(`   - ${campaigns.length} campaigns`);
    console.log(`   - ${billboards.length} billboards`);
    console.log(`   - ${invoices.length} invoices`);
    console.log(`   - ${additionalAdvertisers.length} additional advertisers`);
    
  } catch (err) {
    console.error('❌ Failed to create sample data:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createSampleData();