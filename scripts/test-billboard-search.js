import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testBillboardSearch() {
  try {
    console.log('🔄 Testing Billboard Search API...');
    
    // Test 1: Get all billboards
    console.log('\n1. Testing get all billboards...');
    const allResponse = await fetch(`${API_BASE}/billboards/all`);
    const allData = await allResponse.json();
    console.log('✅ All billboards:', {
      total: allData.total,
      new: allData.new.length,
      old: allData.old.length
    });
    
    // Test 2: Search by postal codes
    console.log('\n2. Testing search by postal codes...');
    const postalResponse = await fetch(`${API_BASE}/billboards/search/postal-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postal_codes: ['90210', '10001', '75001'] })
    });
    const postalData = await postalResponse.json();
    console.log('✅ Postal code search results:');
    Object.keys(postalData).forEach(code => {
      console.log(`   ${code}: ${postalData[code].total} total (${postalData[code].new.length} new, ${postalData[code].old.length} old)`);
    });
    
    // Test 3: Search by sector
    console.log('\n3. Testing search by sector...');
    const sectorResponse = await fetch(`${API_BASE}/billboards/search/sector/Auto`);
    const sectorData = await sectorResponse.json();
    console.log('✅ Sector search (Auto):', {
      total: sectorData.total,
      new: sectorData.new.length,
      old: sectorData.old.length
    });
    
    // Test 4: General search with filters
    console.log('\n4. Testing general search with age filter...');
    const searchResponse = await fetch(`${API_BASE}/billboards/search?age_filter=new`);
    const searchData = await searchResponse.json();
    console.log('✅ New billboards only:', {
      total: searchData.total,
      new: searchData.new.length,
      old: searchData.old.length
    });
    
    console.log('\n🎉 All Billboard Search API tests passed!');
    
  } catch (error) {
    console.error('❌ Billboard Search API test failed:', error.message);
    process.exit(1);
  }
}

testBillboardSearch();