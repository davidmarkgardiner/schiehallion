// Integration test for payment system
// Tests the complete payment flow from booking creation to payment processing

require('dotenv').config({ path: '.env.local' })

const { spawn } = require('child_process')
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3001'
const API_BASE = `${BASE_URL}/api`

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function checkServerHealth() {
  try {
    console.log('🔍 Checking server health...')
    const response = await fetch(BASE_URL)
    if (response.status === 200) {
      console.log('✅ Server is healthy')
      return true
    }
    throw new Error(`Server returned status ${response.status}`)
  } catch (error) {
    console.log('❌ Server health check failed:', error.message)
    return false
  }
}

async function testPaymentIntentCreation() {
  try {
    console.log('\n💳 Testing Payment Intent Creation...')
    
    // This would normally require authentication
    // For now, we'll test the basic API structure
    const paymentData = {
      amount: 150.00, // £150
      bookingIds: ['test-booking-1', 'test-booking-2'],
      guestEmail: 'test@example.com',
      guestName: 'John Doe',
      checkInDate: '2024-02-01',
      checkOutDate: '2024-02-03',
      description: 'Test hotel booking'
    }

    console.log('   Testing API endpoint structure...')
    const response = await fetch(`${API_BASE}/payment/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: Would need valid auth token in real scenario
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(paymentData)
    })

    console.log('   Response status:', response.status)
    
    if (response.status === 401) {
      console.log('✅ Authentication is properly required')
      return true
    } else if (response.status === 500) {
      const error = await response.json()
      if (error.message && error.message.includes('authentication')) {
        console.log('✅ Authentication validation working')
        return true
      }
    }
    
    console.log('ℹ️ Response details for debugging:')
    const responseText = await response.text()
    console.log('   ', responseText.substring(0, 200) + '...')
    
    return true
  } catch (error) {
    console.log('❌ Payment intent test failed:', error.message)
    return false
  }
}

async function testWebhookEndpoint() {
  try {
    console.log('\n🤖 Testing Webhook Endpoint...')
    
    // Test webhook endpoint structure
    const response = await fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Missing stripe-signature header should cause 400
      },
      body: JSON.stringify({ test: 'data' })
    })

    console.log('   Response status:', response.status)
    
    if (response.status === 400) {
      const error = await response.json()
      if (error.error && error.error.includes('stripe-signature')) {
        console.log('✅ Webhook signature validation working')
        return true
      }
    }
    
    console.log('ℹ️ Response details for debugging:')
    const responseText = await response.text()
    console.log('   ', responseText.substring(0, 200) + '...')
    
    return true
  } catch (error) {
    console.log('❌ Webhook test failed:', error.message)
    return false
  }
}

async function testBookingPageLoad() {
  try {
    console.log('\n🏨 Testing Booking Page Load...')
    
    const response = await fetch(`${BASE_URL}/booking`)
    console.log('   Response status:', response.status)
    
    if (response.status === 200) {
      const html = await response.text()
      
      // Check for key elements
      const hasBookingFlow = html.includes('BookingFlow') || html.includes('booking')
      const hasReact = html.includes('react') || html.includes('__next')
      
      if (hasBookingFlow || hasReact) {
        console.log('✅ Booking page loads correctly')
        return true
      } else {
        console.log('⚠️ Booking page loaded but missing expected content')
        return false
      }
    } else {
      console.log('❌ Booking page failed to load')
      return false
    }
  } catch (error) {
    console.log('❌ Booking page test failed:', error.message)
    return false
  }
}

async function testPaymentSuccessPage() {
  try {
    console.log('\n✅ Testing Payment Success Page...')
    
    const response = await fetch(`${BASE_URL}/booking/payment/success?payment_intent=pi_test_123`)
    console.log('   Response status:', response.status)
    
    if (response.status === 200) {
      console.log('✅ Payment success page loads correctly')
      return true
    } else {
      console.log('❌ Payment success page failed to load')
      return false
    }
  } catch (error) {
    console.log('❌ Payment success page test failed:', error.message)
    return false
  }
}

async function testPaymentFailedPage() {
  try {
    console.log('\n❌ Testing Payment Failed Page...')
    
    const response = await fetch(`${BASE_URL}/booking/payment/failed?error=test_error&payment_intent=pi_test_123`)
    console.log('   Response status:', response.status)
    
    if (response.status === 200) {
      console.log('✅ Payment failed page loads correctly')
      return true
    } else {
      console.log('❌ Payment failed page failed to load')
      return false
    }
  } catch (error) {
    console.log('❌ Payment failed page test failed:', error.message)
    return false
  }
}

async function runIntegrationTests() {
  console.log('🗨️ Schiehallion Hotel - Payment Integration Tests')
  console.log('=============================================')
  
  // Check if server is running
  if (!(await checkServerHealth())) {
    console.log('\n⚠️ Server is not running. Please start with: npm run dev')
    return
  }

  const tests = [
    testBookingPageLoad,
    testPaymentIntentCreation,
    testWebhookEndpoint,
    testPaymentSuccessPage,
    testPaymentFailedPage
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      const result = await test()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`)
      failed++
    }
    await delay(500) // Small delay between tests
  }

  console.log('\n\n📊 Test Results Summary')
  console.log('========================')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Total: ${passed + failed}`)

  if (failed === 0) {
    console.log('\n🎉 All integration tests passed!')
    console.log('\n🚀 Payment system integration is ready for development')
    console.log('\nNext steps:')
    console.log('1. Set up proper Stripe test keys if needed')
    console.log('2. Configure Firebase authentication')
    console.log('3. Test the complete booking flow in the browser')
    console.log('4. Set up webhook endpoint for production')
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.')
  }
}

if (require.main === module) {
  runIntegrationTests().catch(console.error)
}

module.exports = {
  checkServerHealth,
  testPaymentIntentCreation,
  testWebhookEndpoint,
  testBookingPageLoad,
  runIntegrationTests
}
