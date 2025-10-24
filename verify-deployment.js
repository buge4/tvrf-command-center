#!/usr/bin/env node

/**
 * TVRF Command Center - Deployment Verification Script
 * 
 * This script verifies that all critical endpoints and functionality
 * are working correctly after Railway deployment.
 * 
 * Usage:
 *   node verify-deployment.js <railway-app-url>
 * 
 * Example:
 *   node verify-deployment.js https://your-app.railway.app
 */

import https from 'https';
import http from 'http';

const args = process.argv.slice(2);
const baseUrl = args[0];

if (!baseUrl) {
  console.error('❌ Error: Please provide your Railway app URL');
  console.error('Usage: node verify-deployment.js <railway-app-url>');
  console.error('Example: node verify-deployment.js https://your-app.railway.app');
  process.exit(1);
}

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const req = client.get(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

const makePostRequest = (url, body) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const data = JSON.stringify(body);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const tests = [
  {
    name: 'Health Check',
    url: `${baseUrl}/api/health`,
    method: 'GET',
    validate: (response) => {
      return response.status === 200 && 
             response.data.status === 'healthy' &&
             response.data.service === 'TVRF Command Center';
    }
  },
  {
    name: 'Dashboard Access',
    url: `${baseUrl}/dashboard`,
    method: 'GET',
    validate: (response) => {
      return response.status === 200 && 
             typeof response.data === 'string' &&
             response.data.includes('dashboard');
    }
  },
  {
    name: 'Root Path',
    url: `${baseUrl}/`,
    method: 'GET',
    validate: (response) => {
      return response.status === 200 && 
             typeof response.data === 'string' &&
             response.data.includes('command-center');
    }
  },
  {
    name: 'Chat API',
    url: `${baseUrl}/api/chat`,
    method: 'POST',
    body: { message: 'Hello, verify deployment!' },
    validate: (response) => {
      return response.status === 200 && 
             response.data.success === true &&
             typeof response.data.response === 'string';
    }
  }
];

const runTests = async () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║    TVRF Command Center - Deployment Verification    ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  console.log(`🔍 Testing deployment at: ${baseUrl}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    process.stdout.write(`⏳ ${test.name}... `);
    
    try {
      let response;
      if (test.method === 'POST') {
        response = await makePostRequest(test.url, test.body);
      } else {
        response = await makeRequest(test.url);
      }
      
      const isValid = test.validate(response);
      
      if (isValid) {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log('❌ FAILED');
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                   Test Summary                        ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is successful!\n');
    console.log('Next steps:');
    console.log('  1. Visit your dashboard: ' + baseUrl + '/dashboard');
    console.log('  2. Test chat functionality');
    console.log('  3. Update ALLOWED_ORIGINS with your Railway domain');
    console.log('  4. Monitor logs in Railway dashboard');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.\n');
    console.log('Troubleshooting:');
    console.log('  1. Check Railway deployment logs');
    console.log('  2. Verify all environment variables are set');
    console.log('  3. Ensure database schema is created in Supabase');
    console.log('  4. Test locally first: npm start');
    process.exit(1);
  }
};

runTests();
