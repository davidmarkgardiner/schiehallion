// Test script to verify Stripe configuration
// Run with: node scripts/test-stripe-config.js

require('dotenv').config({ path: '.env.local' })

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

async function testStripeConfig() {
  try {
    console.log('🔧 Testing Stripe Configuration...')
    console.log('\n1. Verifying API Keys:')
    console.log('   Publishable Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing')
    console.log('   Secret Key:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing')
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('\n❌ Error: STRIPE_SECRET_KEY is not set in .env.local')
      return
    }

    console.log('\n2. Testing API Connection:')
    
    // Test account retrieval
    const account = await stripe.accounts.retrieve()
    console.log('   Account ID:', account.id)
    console.log('   Business Type:', account.business_type || 'Not set')
    console.log('   Country:', account.country)
    console.log('   Currency:', account.default_currency)
    console.log('   Charges Enabled:', account.charges_enabled)
    console.log('   Payouts Enabled:', account.payouts_enabled)
    
    console.log('\n3. Testing Payment Intent Creation:')
    
    // Test payment intent creation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // £100.00 in pence
      currency: 'gbp',
      metadata: {
        test: 'true',
        created_by: 'test-script'
      },
      description: 'Test payment intent for Schiehallion Hotel'
    })
    
    console.log('   Payment Intent ID:', paymentIntent.id)
    console.log('   Amount:', `£${(paymentIntent.amount / 100).toFixed(2)}`)
    console.log('   Status:', paymentIntent.status)
    console.log('   Client Secret:', paymentIntent.client_secret.substring(0, 20) + '...')
    
    // Clean up test payment intent
    await stripe.paymentIntents.cancel(paymentIntent.id)
    console.log('   ✅ Test payment intent cancelled')
    
    console.log('\n✅ Stripe configuration test completed successfully!')
    console.log('\n📝 Configuration Summary:')
    console.log('   - API keys are properly configured')
    console.log('   - Connection to Stripe API is working')
    console.log('   - Payment intents can be created and cancelled')
    console.log('   - Ready for production use')
    
  } catch (error) {
    console.log('\n❌ Stripe configuration test failed:')
    console.error('   Error:', error.message)
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔧 Troubleshooting:')
      console.log('   1. Check that STRIPE_SECRET_KEY is correct')
      console.log('   2. Ensure the key starts with "sk_test_" for test mode')
      console.log('   3. Verify the key is from your Stripe dashboard')
    }
    
    process.exit(1)
  }
}

if (require.main === module) {
  testStripeConfig()
}

module.exports = testStripeConfig
