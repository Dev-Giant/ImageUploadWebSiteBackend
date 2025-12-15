import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testFullFlow() {
  try {
    console.log('🔄 Testing full API flow...');
    
    // Step 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@advertiser.com',
        password: 'password123',
        role: 'advertiser'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Token:', loginData.token ? 'Present' : 'Missing');
    console.log('   User:', loginData.user);
    
    if (!loginData.token) {
      throw new Error('No token received');
    }
    
    // Step 2: Get campaigns
    console.log('\n2. Testing campaigns endpoint...');
    const campaignsResponse = await fetch(`${API_BASE}/advertiser/campaigns`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!campaignsResponse.ok) {
      throw new Error(`Campaigns failed: ${campaignsResponse.status} ${campaignsResponse.statusText}`);
    }
    
    const campaignsData = await campaignsResponse.json();
    console.log('✅ Campaigns retrieved successfully');
    console.log(`   Count: ${campaignsData.length}`);
    console.log('   Sample:', campaignsData[0] || 'No campaigns');
    
    // Step 3: Get account
    console.log('\n3. Testing account endpoint...');
    const accountResponse = await fetch(`${API_BASE}/advertiser/account`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!accountResponse.ok) {
      throw new Error(`Account failed: ${accountResponse.status} ${accountResponse.statusText}`);
    }
    
    const accountData = await accountResponse.json();
    console.log('✅ Account retrieved successfully');
    console.log('   Account:', accountData);
    
    // Step 4: Get invoices
    console.log('\n4. Testing invoices endpoint...');
    const invoicesResponse = await fetch(`${API_BASE}/advertiser/invoices`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!invoicesResponse.ok) {
      throw new Error(`Invoices failed: ${invoicesResponse.status} ${invoicesResponse.statusText}`);
    }
    
    const invoicesData = await invoicesResponse.json();
    console.log('✅ Invoices retrieved successfully');
    console.log(`   Count: ${invoicesData.length}`);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

testFullFlow();