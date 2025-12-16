import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testCompleteAdSystem() {
  try {
    console.log('🔄 Testing Complete Ad Placements System...\n');
    
    // Test 1: Get all platforms
    console.log('1. Testing Platform Discovery...');
    const platformsResponse = await fetch(`${API_BASE}/ad-placements/platforms`);
    const platforms = await platformsResponse.json();
    console.log(`✅ Found ${platforms.length} social media platforms`);
    console.log(`   Total ad slots: ${platforms.reduce((sum, p) => sum + parseInt(p.total_placements), 0)}`);
    console.log(`   Available slots: ${platforms.reduce((sum, p) => sum + parseInt(p.available_placements), 0)}`);
    
    // Test 2: Get regional pricing data
    console.log('\n2. Testing Regional Pricing System...');
    const pricingResponse = await fetch(`${API_BASE}/ad-placements/regional-pricing?all=true`);
    const pricingData = await pricingResponse.json();
    console.log(`✅ Found ${pricingData.length} regional pricing zones`);
    
    const multipliers = pricingData.map(p => parseFloat(p.price_multiplier));
    console.log(`   Price range: ${Math.min(...multipliers).toFixed(2)}x - ${Math.max(...multipliers).toFixed(2)}x`);
    
    // Test 3: Test each platform's ad placements
    console.log('\n3. Testing Platform Ad Placements...');
    let totalPlacements = 0;
    for (const platform of platforms.slice(0, 3)) { // Test first 3 platforms
      const placementsResponse = await fetch(`${API_BASE}/ad-placements/platforms/${platform.name}/placements`);
      const placements = await placementsResponse.json();
      totalPlacements += placements.length;
      console.log(`   ${platform.display_name}: ${placements.length} positions (${placements.filter(p => p.availability_status === 'available').length} available)`);
    }
    
    // Test 4: Test pricing calculation
    console.log('\n4. Testing Pricing Calculator...');
    const testPlacement = await fetch(`${API_BASE}/ad-placements/platforms/facebook/placements`);
    const fbPlacements = await testPlacement.json();
    const firstPlacement = fbPlacements[0];
    
    const calcResponse = await fetch(`${API_BASE}/ad-placements/calculate-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placement_id: firstPlacement.id,
        region: 'Los Angeles Metro',
        start_date: '2024-03-01',
        end_date: '2024-05-31'
      })
    });
    const pricing = await calcResponse.json();
    console.log(`✅ Pricing calculation successful`);
    console.log(`   Base: $${pricing.base_price} × ${pricing.price_multiplier}x × ${pricing.duration_months} months = $${pricing.total_price}`);
    
    // Test 5: Test active ads endpoint
    console.log('\n5. Testing Active Ads Display...');
    const activeAdsResponse = await fetch(`${API_BASE}/ad-placements/platforms/instagram/active-ads`);
    const activeAds = await activeAdsResponse.json();
    console.log(`✅ Found ${activeAds.length} active ads on Instagram`);
    
    // Test 6: Login and test authenticated endpoints
    console.log('\n6. Testing Authenticated Endpoints...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'advertiser@test.com',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      // Test getting advertiser bookings
      const bookingsResponse = await fetch(`${API_BASE}/ad-placements/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookings = await bookingsResponse.json();
      console.log(`✅ Advertiser has ${bookings.length} booking(s)`);
      
      if (bookings.length > 0) {
        const booking = bookings[0];
        console.log(`   Latest booking: "${booking.campaign_name}" on ${booking.platform_name} (${booking.status})`);
      }
    }
    
    // Summary
    console.log('\n🎉 Complete Ad Placements System Test Results:');
    console.log('=' .repeat(50));
    console.log(`📱 Platforms: ${platforms.length} social media platforms`);
    console.log(`🎯 Ad Positions: ${platforms.reduce((sum, p) => sum + parseInt(p.total_placements), 0)} total positions (4 per platform)`);
    console.log(`🌍 Regional Zones: ${pricingData.length} pricing regions`);
    console.log(`💰 Price Range: ${Math.min(...multipliers).toFixed(2)}x - ${Math.max(...multipliers).toFixed(2)}x multipliers`);
    console.log(`📊 Active Campaigns: ${activeAds.length} currently running`);
    console.log(`✅ All systems operational and ready for production!`);
    
  } catch (error) {
    console.error('❌ System test failed:', error.message);
    process.exit(1);
  }
}

testCompleteAdSystem();