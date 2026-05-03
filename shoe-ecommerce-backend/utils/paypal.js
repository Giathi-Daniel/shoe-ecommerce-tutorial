const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

const environment =
  process.env.PAYPAL_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
  environment,
});

module.exports = {
  ordersController: new OrdersController(client),
};
