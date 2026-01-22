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

const upcomingDraws = [
  {
    name: 'Luxury Vehicle Sweepstakes - Los Angeles',
    country: 'US',
    city: 'Los Angeles',
    wave: 'Wave1',
    status: 'upcoming',
    start_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
    end_date: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0], // 90 days from now
    description: 'Win your dream luxury vehicle! Tesla Model S, BMW X7, or Mercedes S-Class - your choice!'
  },
  {
    name: 'Gold Bullion Prize Draw - New York',
    country: 'US',
    city: 'New York',
    wave: 'Wave1',
    status: 'upcoming',
    start_date: new Date(Date.now() + 45*24*60*60*1000).toISOString().split('T')[0], // 45 days from now
    end_date: new Date(Date.now() + 105*24*60*60*1000).toISOString().split('T')[0], // 105 days from now
    description: 'Win 1 oz of pure gold bullion plus $10,000 cash prize!'
  },
  {
    name: 'Designer Handbag Collection - Miami',
    country: 'US',
    city: 'Miami',
    wave: 'Wave1',
    status: 'upcoming',
    start_date: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0], // 60 days from now
    end_date: new Date(Date.now() + 120*24*60*60*1000).toISOString().split('T')[0], // 120 days from now
    description: 'Luxury handbag collection worth $25,000 from top designers!'
  },
  {
    name: 'Exclusive Vacation Experience - Chicago',
    country: 'US',
    city: 'Chicago',
    wave: 'Wave1',
    status: 'upcoming',
    start_date: new Date(Date.now() + 75*24*60*60*1000).toISOString().split('T')[0], // 75 days from now
    end_date: new Date(Date.now() + 135*24*60*60*1000).toISOString().split('T')[0], // 135 days from now
    description: '7-day luxury vacation to Maldives with first-class flights and 5-star resort!'
  }
];

async function setupLaunchData() {
  try {
    console.log('🚀 Setting up launch data...');
    
    // Add status column to draws table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE draws 
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming',
        ADD COLUMN IF NOT EXISTS start_date DATE,
        ADD COLUMN IF NOT EXISTS end_date DATE,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
      `);
      console.log('✅ Updated draws table schema');
    } catch (err) {
      console.log('⚠️  Draws table schema already updated or error:', err.message);
    }
    
    // Clear existing draws and add upcoming ones
    await pool.query('DELETE FROM entries'); // Clear entries first due to foreign key
    await pool.query('DELETE FROM draws');
    console.log('🗑️  Cleared existing draws');
    
    // Insert upcoming draws
    for (const draw of upcomingDraws) {
      await pool.query(`
        INSERT INTO draws (name, country, city, wave, status, start_date, end_date, description, next_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
      `, [
        draw.name,
        draw.country,
        draw.city,
        draw.wave,
        draw.status,
        draw.start_date,
        draw.end_date,
        draw.description
      ]);
    }
    
    console.log(`✅ Added ${upcomingDraws.length} upcoming draws`);
    
    // Update static pages for launch version
    const launchPages = [
      {
        slug: 'privacy',
        title: 'Privacy Policy',
        content: `
          <h1>Privacy Policy - Gotta Scan Them All™</h1>
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>Information We Collect</h2>
          <p>We collect information you provide when registering for our sweepstakes platform, including:</p>
          <ul>
            <li>Personal information (name, email, phone number)</li>
            <li>Location information (postal code, region)</li>
            <li>Demographic information (age, gender)</li>
          </ul>
          
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Notify you when sweepstakes launch in your area</li>
            <li>Send you updates about prizes and promotions</li>
            <li>Verify eligibility and identity for prize awards</li>
            <li>Improve our services and user experience</li>
          </ul>
          
          <h2>Information Sharing</h2>
          <p>We do not sell or share your personal information with third parties except as required by law or to fulfill prize obligations.</p>
          
          <h2>Contact Us</h2>
          <p>For privacy questions, contact us at privacy@gottascanthemall.com</p>
        `
      },
      {
        slug: 'terms',
        title: 'Terms and Conditions',
        content: `
          <h1>Terms and Conditions - Gotta Scan Them All™</h1>
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>Eligibility</h2>
          <p>You must be 18 years or older and a legal resident of participating regions to register and participate in sweepstakes.</p>
          
          <h2>Registration</h2>
          <p>By registering, you agree to receive notifications about sweepstakes launches and promotional updates. No purchase necessary.</p>
          
          <h2>Prize Information</h2>
          <p>Prizes will be awarded according to official rules published when each sweepstake launches. Prize values and availability subject to change.</p>
          
          <h2>Limitation of Liability</h2>
          <p>Gotta Scan Them All™ is not responsible for technical failures, lost entries, or other issues beyond our reasonable control.</p>
          
          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of updated terms.</p>
          
          <h2>Contact</h2>
          <p>Questions about these terms? Contact us at legal@gottascanthemall.com</p>
        `
      }
    ];
    
    for (const page of launchPages) {
      await pool.query(`
        INSERT INTO static_pages (slug, title, content, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          updated_at = NOW()
      `, [page.slug, page.title, page.content]);
    }
    
    console.log('✅ Updated static pages for launch version');
    
    console.log('\n🎉 Launch data setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${upcomingDraws.length} upcoming sweepstakes added`);
    console.log('   - Privacy policy updated');
    console.log('   - Terms and conditions updated');
    console.log('   - All draws marked as "upcoming" status');
    
  } catch (err) {
    console.error('❌ Launch data setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupLaunchData();