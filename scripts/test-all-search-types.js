import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testAllSearchTypes() {
  try {
    console.log('🔄 Testing All Billboard Search Types...');
    
    // Test 1: Postal Code Search
    console.log('\n1. Testing Postal Code Search...');
    const postalResponse = await fetch(`${API_BASE}/billboards/search/postal-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postal_codes: ['90210', '10001'] })
    });
    const postalData = await postalResponse.json();
    console.log('✅ Postal Code Search Results:');
    Object.keys(postalData).forEach(code => {
      console.log(`   ${code}: ${postalData[code].total} total (${postalData[code].new.length} new, ${postalData[code].old.length} old)`);
    });
    
    // Test 2: Sector Search
    console.log('\n2. Testing Sector Search...');
    const sectorResponse = await fetch(`${API_BASE}/billboards/search/sector/Auto`);
    const sectorData = await sectorResponse.json();
    console.log('✅ Sector Search (Auto):', {
      sector: sectorData.sector,
      total: sectorData.total,
      new: sectorData.new.length,
      old: sectorData.old.length
    });
    
    // Test 3: Country/Region Search
    console.log('\n3. Testing Country Search...');
    const countryResponse = await fetch(`${API_BASE}/billboards/search?country=USA`);
    const countryData = await countryResponse.json();
    console.log('✅ Country Search (USA):', {
      total: countryData.total,
      new: countryData.new.length,
      old: countryData.old.length
    });
    
    // Test 4: State Search
    console.log('\n4. Testing State Search...');
    const stateResponse = await fetch(`${API_BASE}/billboards/search?state=California`);
    const stateData = await stateResponse.json();
    console.log('✅ State Search (California):', {
      total: stateData.total,
      new: stateData.new.length,
      old: stateData.old.length
    });
    
    // Test 5: Combined Search
    console.log('\n5. Testing Combined Search...');
    const combinedResponse = await fetch(`${API_BASE}/billboards/search?country=USA&sector=Auto`);
    const combinedData = await combinedResponse.json();
    console.log('✅ Combined Search (USA + Auto):', {
      total: combinedData.total,
      new: combinedData.new.length,
      old: combinedData.old.length
    });
    
    // Test 6: Age Filter
    console.log('\n6. Testing Age Filter (New Only)...');
    const newOnlyResponse = await fetch(`${API_BASE}/billboards/search?age_filter=new`);
    const newOnlyData = await newOnlyResponse.json();
    console.log('✅ New Billboards Only:', {
      total: newOnlyData.total,
      new: newOnlyData.new.length,
      old: newOnlyData.old.length
    });
    
    console.log('\n🎉 All Billboard Search Types tested successfully!');
    
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    process.exit(1);
  }
}

testAllSearchTypes();