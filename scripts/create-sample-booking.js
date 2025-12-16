import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function createSampleBooking() {
  try {
    console.log('🔄 Creating sample ad booking...');
    
    // First, login as advertiser to get token
    console.log('\n1. Logging in as advertiser...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'advertiser@test.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Failed to login as advertiser');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Logged in successfully');
    
    // Get available placements
    console.log('\n2. Getting available placements...');
    const placementsResponse = await fetch(`${API_BASE}/ad-placements/platforms/instagram/placements`);
    const placements = await placementsResponse.json();
    const availablePlacement = placements.find(p => p.availability_status === 'available');
    
    if (!availablePlacement) {
      throw new Error('No available placements found');
    }
    
    console.log('✅ Found available placement:', availablePlacement.position_name);
    
    // Calculate pricing
    console.log('\n3. Calculating pricing...');
    const pricingResponse = await fetch(`${API_BASE}/ad-placements/calculate-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placement_id: availablePlacement.id,
        region: 'New York Metro',
        start_date: '2024-02-01',
        end_date: '2024-04-30'
      })
    });
    
    const pricing = await pricingResponse.json();
    console.log('✅ Pricing calculated:', pricing);
    
    // Create booking
    console.log('\n4. Creating ad booking...');
    const bookingResponse = await fetch(`${API_BASE}/ad-placements/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        placement_id: availablePlacement.id,
        campaign_name: 'Sample Marketing Campaign',
        ad_image_url: 'https://via.placeholder.com/728x90/0066cc/ffffff?text=Sample+Ad',
        ad_link_url: 'https://example.com',
        region: 'New York Metro',
        postal_code: '10001',
        start_date: '2024-02-01',
        end_date: '2024-04-30',
        monthly_price: pricing.monthly_price,
        total_price: pricing.total_price
      })
    });
    
    if (!bookingResponse.ok) {
      const error = await bookingResponse.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    const booking = await bookingResponse.json();
    console.log('✅ Booking created successfully:', booking.booking.id);
    
    // Get advertiser's bookings
    console.log('\n5. Retrieving advertiser bookings...');
    const bookingsResponse = await fetch(`${API_BASE}/ad-placements/bookings`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    const bookings = await bookingsResponse.json();
    console.log('✅ Advertiser has', bookings.length, 'booking(s)');
    
    console.log('\n🎉 Sample booking created successfully!');
    console.log('📊 Booking Details:');
    console.log(`   - Campaign: ${booking.booking.campaign_name}`);
    console.log(`   - Platform: Instagram`);
    console.log(`   - Position: ${availablePlacement.position_name}`);
    console.log(`   - Region: ${booking.booking.region}`);
    console.log(`   - Duration: ${booking.booking.start_date} to ${booking.booking.end_date}`);
    console.log(`   - Total Price: $${booking.booking.total_price}`);
    console.log(`   - Status: ${booking.booking.status}`);
    
  } catch (error) {
    console.error('❌ Failed to create sample booking:', error.message);
    process.exit(1);
  }
}

createSampleBooking();