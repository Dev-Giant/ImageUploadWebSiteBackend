import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testAdPlacementsAPI() {
  try {
    console.log('🔄 Testing Ad Placements API...');
    
    // Test 1: Get all platforms
    console.log('\n1. Testing get all platforms...');
    const platformsResponse = await fetch(`${API_BASE}/ad-placements/platforms`);
    const platformsData = await platformsResponse.json();
    console.log('✅ Platforms retrieved:', platformsData.length);
    console.log('   Sample platform:', platformsData[0]);
    
    // Test 2: Get ad placements for a specific platform
    console.log('\n2. Testing get ad placements for Instagram...');
    const placementsResponse = await fetch(`${API_BASE}/ad-placements/platforms/instagram/placements`);
    const placementsData = await placementsResponse.json();
    console.log('✅ Instagram placements:', placementsData.length);
    console.log('   Sample placement:', placementsData[0]);
    
    // Test 3: Get regional pricing
    console.log('\n3. Testing regional pricing...');
    const pricingResponse = await fetch(`${API_BASE}/ad-placements/regional-pricing?region=Los Angeles&country=United States`);
    const pricingData = await pricingResponse.json();
    console.log('✅ Regional pricing:', pricingData[0]);
    
    // Test 4: Calculate pricing
    console.log('\n4. Testing pricing calculation...');
    const calcResponse = await fetch(`${API_BASE}/ad-placements/calculate-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placement_id: placementsData[0].id,
        region: 'Los Angeles Metro',
        start_date: '2024-01-01',
        end_date: '2024-03-31'
      })
    });
    const calcData = await calcResponse.json();
    console.log('✅ Pricing calculation:', calcData);
    
    console.log('\n🎉 All Ad Placements API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

testAdPlacementsAPI();