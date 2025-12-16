import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function createTestAdvertiser() {
  try {
    console.log('🔄 Creating test advertiser account...');
    
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'advertiser@test.com',
        password: 'password123',
        role: 'advertiser',
        first_name: 'Test',
        last_name: 'Advertiser',
        company_name: 'Test Marketing Co.',
        phone: '+1-555-0123'
      })
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      if (error.error && error.error.includes('already exists')) {
        console.log('✅ Test advertiser account already exists');
        return;
      }
      throw new Error(error.error || 'Failed to register advertiser');
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ Test advertiser account created successfully');
    console.log('📧 Email:', 'advertiser@test.com');
    console.log('🔑 Password:', 'password123');
    console.log('👤 Role:', 'advertiser');
    
  } catch (error) {
    console.error('❌ Failed to create test advertiser:', error.message);
    process.exit(1);
  }
}

createTestAdvertiser();