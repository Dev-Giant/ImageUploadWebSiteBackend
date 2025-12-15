import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test JWT token generation and parsing
const testUser = {
  id: 6,
  email: 'test@advertiser.com',
  role: 'advertiser'
};

console.log('🔄 Testing JWT token generation...');

// Generate token
const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1d' });
console.log('✅ Token generated:', token);

// Parse token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token decoded:', decoded);
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
}

// Test token parsing like the frontend does
try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log('✅ Frontend-style parsing:', payload);
} catch (error) {
  console.error('❌ Frontend parsing failed:', error.message);
}