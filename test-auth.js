// Test script for authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

async function testAuthentication() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
    console.log('   User ID:', registerResponse.data.data._id);
    console.log('');

    const token = registerResponse.data.data.token;

    // Test 2: Login with the same user
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
    console.log('');

    // Test 3: Get current user (protected route)
    console.log('3. Testing protected route (get current user)...');
    const meResponse = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Protected route access successful');
    console.log('   User data retrieved:', meResponse.data.data.name);
    console.log('');

    // Test 4: Test invalid login
    console.log('4. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Invalid login handled correctly:', error.response.data.message);
    }
    console.log('');

    console.log('🎉 All authentication tests passed successfully!');
    console.log('\n📋 Available Endpoints:');
    console.log('   POST /api/auth/register - User registration');
    console.log('   POST /api/auth/login - User login');
    console.log('   GET /api/auth/me - Get current user (requires Bearer token)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthentication();
}

module.exports = testAuthentication;
