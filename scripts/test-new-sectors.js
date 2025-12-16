import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

async function testNewSectors() {
  try {
    console.log('🔄 Testing New Sector Searches...');
    
    const sectors = ['Tech', 'Healthcare', 'Finance', 'Retail', 'Fashion', 'Restaurant'];
    
    for (const sector of sectors) {
      const response = await fetch(`${API_BASE}/billboards/search/sector/${sector}`);
      const data = await response.json();
      console.log(`✅ ${sector}: ${data.total} total (${data.new.length} new, ${data.old.length} old)`);
    }
    
    console.log('\n🎉 All new sectors tested!');
    
  } catch (error) {
    console.error('❌ Sector test failed:', error.message);
  }
}

testNewSectors();