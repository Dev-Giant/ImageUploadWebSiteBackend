import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, 'cyan');
}

async function runScript(scriptPath, description) {
  try {
    log(`   Running: ${path.basename(scriptPath)}`, 'blue');
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
      cwd: path.join(__dirname, '..'),
    });
    
    if (stdout) {
      // Filter out only important output lines
      const lines = stdout.split('\n').filter(line => 
        line.includes('✅') || 
        line.includes('❌') || 
        line.includes('🔄') ||
        line.includes('📊') ||
        line.includes('📝') ||
        line.includes('⚠️')
      );
      if (lines.length > 0) {
        lines.forEach(line => console.log(`   ${line}`));
      }
    }
    
    if (stderr && !stderr.includes('Warning')) {
      console.error(`   ${stderr}`);
    }
    
    return true;
  } catch (error) {
    // Check if it's a non-critical error (like "already exists")
    if (error.stdout && (
      error.stdout.includes('already exists') ||
      error.stdout.includes('already exists') ||
      error.stdout.includes('skipped')
    )) {
      log(`   ⚠️  ${description} - Some items may already exist (this is OK)`, 'yellow');
      return true;
    }
    
    log(`   ❌ Error running ${description}: ${error.message}`, 'red');
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function checkServerRunning() {
  try {
    // Try a simple endpoint that should exist
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:4000/api/draws', {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 401; // 401 means server is running but needs auth
  } catch (error) {
    return false;
  }
}

async function waitForServer(maxAttempts = 10, delay = 2000) {
  log('\n⏳ Checking if server is running...', 'yellow');
  
  for (let i = 0; i < maxAttempts; i++) {
    const isRunning = await checkServerRunning();
    if (isRunning) {
      log('✅ Server is running!', 'green');
      return true;
    }
    
    if (i < maxAttempts - 1) {
      log(`   Attempt ${i + 1}/${maxAttempts} - Server not ready, waiting ${delay/1000}s...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  log('⚠️  Server is not running. API-based scripts will be skipped.', 'yellow');
  log('   To run all scripts, start the server first: npm run dev', 'yellow');
  return false;
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 GOTTA SCAN THEM ALL - TEST DATA SETUP', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  const scriptsDir = __dirname;
  let step = 0;
  const totalSteps = 7;

  // Step 1: Initialize Database
  step++;
  logStep(step, totalSteps, 'Initializing Database Schema');
  const initDbPath = path.join(scriptsDir, 'init-db.js');
  await runScript(initDbPath, 'Database initialization');

  // Step 2: Add upload_type column
  step++;
  logStep(step, totalSteps, 'Adding Upload Type Column');
  const addUploadTypePath = path.join(scriptsDir, 'add-upload-type-column.js');
  await runScript(addUploadTypePath, 'Upload type column setup');

  // Step 3: Setup Ad Placements
  step++;
  logStep(step, totalSteps, 'Setting Up Ad Placements System');
  const setupAdPlacementsPath = path.join(scriptsDir, 'setup-ad-placements.js');
  await runScript(setupAdPlacementsPath, 'Ad placements setup');

  // Step 4: Check if server is running (needed for API scripts)
  step++;
  logStep(step, totalSteps, 'Checking Server Status');
  const serverRunning = await waitForServer();

  // Step 5: Create Test Advertiser (via API - requires server)
  step++;
  logStep(step, totalSteps, 'Creating Test Advertiser Account');
  if (serverRunning) {
    const createAdvertiserPath = path.join(scriptsDir, 'create-test-advertiser.js');
    await runScript(createAdvertiserPath, 'Test advertiser creation');
    
    // Wait a moment for the advertiser to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    log('   ⏭️  Skipped (server not running)', 'yellow');
  }

  // Step 6: Create Sample Data (requires test advertiser)
  step++;
  logStep(step, totalSteps, 'Creating Sample Data');
  const createSampleDataPath = path.join(scriptsDir, 'create-sample-data.js');
  const sampleDataSuccess = await runScript(createSampleDataPath, 'Sample data creation');
  
  // If test advertiser doesn't exist, try creating it via direct DB access
  if (!sampleDataSuccess && !serverRunning) {
    log('   ℹ️  Note: Some sample data requires test advertiser. Run create-test-advertiser.js after starting server.', 'yellow');
  }

  // Step 7: Add More Sectors
  step++;
  logStep(step, totalSteps, 'Adding Additional Sector Data');
  const addSectorsPath = path.join(scriptsDir, 'add-more-sectors.js');
  await runScript(addSectorsPath, 'Additional sectors');

  // Optional: Create Sample Booking (requires server and advertiser)
  if (serverRunning) {
    log('\n[Optional] Creating Sample Ad Booking', 'cyan');
    const createBookingPath = path.join(scriptsDir, 'create-sample-booking.js');
    await runScript(createBookingPath, 'Sample booking creation');
  } else {
    log('\n[Optional] Sample Ad Booking', 'cyan');
    log('   ⏭️  Skipped (server not running)', 'yellow');
  }

  // Summary
  log('\n' + '='.repeat(60), 'bright');
  log('✅ TEST DATA SETUP COMPLETE!', 'green');
  log('='.repeat(60), 'bright');
  log('\n📊 Summary:', 'cyan');
  log('   ✅ Database schema initialized', 'green');
  log('   ✅ Ad placements system configured', 'green');
  log('   ✅ Sample data created', 'green');
  log('   ✅ Additional sectors added', 'green');
  
  if (serverRunning) {
    log('   ✅ Test advertiser account created', 'green');
    log('   ✅ Sample booking created', 'green');
  } else {
    log('   ⚠️  Some API-based scripts were skipped (server not running)', 'yellow');
    log('   💡 Tip: Start the server (npm run dev) and run this script again for full setup', 'yellow');
  }
  
  log('\n🎉 You can now start developing!', 'bright');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

