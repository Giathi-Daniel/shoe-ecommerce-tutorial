const paypal = require('@paypal/checkout-server-sdk');

// Create environment with client ID and client secret
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

// Create PayPal HTTP client
const paypalClient = new paypal.core.PayPalHttpClient(environment);

module.exports = paypalClient;
