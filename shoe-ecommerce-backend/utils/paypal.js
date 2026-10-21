const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

const isConfigured = !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

const client = isConfigured
  ? new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
      },
      environment: process.env.PAYPAL_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
    })
  : null;

module.exports = {
  ordersController: client ? new OrdersController(client) : null,
};
