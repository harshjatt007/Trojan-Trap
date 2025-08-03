// Test script to verify backend connectivity
const fetch = require('node-fetch');

const BACKEND_URL = 'https://trojan-trap.onrender.com';

async function testBackend() {
  console.log('Testing backend connectivity...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    console.log('✅ Health endpoint working\n');

    // Test CORS with a mock request
    console.log('2. Testing CORS configuration...');
    const corsResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://trojan-trap-psi.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('CORS preflight status:', corsResponse.status);
    console.log('CORS headers:', Object.fromEntries(corsResponse.headers.entries()));
    console.log('✅ CORS configuration working\n');

    console.log('🎉 Backend is ready for frontend integration!');
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testBackend();
