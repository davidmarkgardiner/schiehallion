// Simple debug script to check booking page issues
const https = require('https');
const http = require('http');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n${description}:`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

        if (res.statusCode === 404) {
          console.log('❌ 404 - Page not found');
        } else if (res.statusCode === 200) {
          console.log('✅ 200 - Page loads');
          console.log(`Content length: ${data.length}`);

          // Check for specific content
          if (data.includes('404')) {
            console.log('⚠️  Contains 404 error in content');
          }
          if (data.includes('booking')) {
            console.log('✅ Contains "booking" in content');
          }
          if (data.includes('stripe')) {
            console.log('✅ Contains "stripe" in content');
          }
        } else {
          console.log(`❓ Unexpected status: ${res.statusCode}`);
        }

        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  console.log('🔍 Testing Schiehallion booking page accessibility...\n');

  await testEndpoint('http://localhost:3002/', 'Homepage');
  await testEndpoint('http://localhost:3002/rooms', 'Rooms page');
  await testEndpoint('http://localhost:3002/booking', 'Booking page');
  await testEndpoint('http://localhost:3002/booking/payment/success', 'Payment success page');
  await testEndpoint('http://localhost:3002/booking/payment/failed', 'Payment failure page');

  console.log('\n🏁 Debug complete');
}

main().catch(console.error);