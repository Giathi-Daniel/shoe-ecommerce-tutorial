const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const stripe = require('../utils/stripe');
const { ordersController } = require('../utils/paypal');
const logger = require('../utils/logger');

const variantName = (item) => [item.name, item.size && `Size ${item.size}`, item.color].filter(Boolean).join(' - ');

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const loadPayableOrder = async (req, res, method) => {
  const { orderId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(404).json({ message: 'Order not found' });
    return null;
  }

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
  } else if (order.paymentMethod !== method) {
    res.status(400).json({ message: `This order is set to pay with ${order.paymentMethod}` });
  } else if (order.paymentStatus === 'paid' || order.orderStatus === 'cancelled') {
    res.status(400).json({ message: `This order is ${order.orderStatus === 'cancelled' ? 'cancelled' : 'already paid'}` });
  } else {
    return order;
  }
  return null;
};

const markPaid = async (order, paymentResult) => {
  order.paymentStatus = 'paid';
  order.paidAt = new Date();
  order.paymentResult = paymentResult;
  if (order.orderStatus === 'pending') order.orderStatus = 'processing';
  await order.save();
  logger.info(`Order ${order._id} paid via ${order.paymentMethod}`);
};

// POST /api/payments/stripe/session
exports.createStripeSession = async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Card payments are not configured on this server' });

    const order = await loadPayableOrder(req, res, 'stripe');
    if (!order) return;

    const toCents = (amount) => Math.round(amount * 100);
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: variantName(item), images: item.image.startsWith('http') ? [item.image] : [] },
        unit_amount: toCents(item.price),
      },
      quantity: item.quantity,
    }));

    [['Shipping', order.shippingPrice], ['Estimated tax', order.taxPrice]].forEach(([name, amount]) => {
      if (amount > 0) {
        lineItems.push({
          price_data: { currency: 'usd', product_data: { name }, unit_amount: toCents(amount) },
          quantity: 1,
        });
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${clientUrl()}/orders/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl()}/orders/${order._id}`,
      metadata: { orderId: order._id.toString(), userId: req.user.id },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/stripe/confirm
exports.confirmStripePayment = async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Card payments are not configured on this server' });

    const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
    const order = await Order.findOne({ _id: session.metadata?.orderId, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
      await markPaid(order, {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details?.email,
      });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/stripe/webhook (raw body)
exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(503).end();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findById(session.metadata?.orderId);
    if (order && order.paymentStatus !== 'paid') {
      await markPaid(order, {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details?.email,
      });
    }
  }

  res.status(200).json({ received: true });
};

// POST /api/payments/paypal/create
exports.createPayPalOrder = async (req, res, next) => {
  try {
    if (!ordersController) return res.status(503).json({ message: 'PayPal is not configured on this server' });

    const order = await loadPayableOrder(req, res, 'paypal');
    if (!order) return;

    const money = (value) => ({ currencyCode: 'USD', value: value.toFixed(2) });
    const result = await ordersController.createOrder({
      prefer: 'return=representation',
      paypalRequestId: randomUUID(),
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            customId: order._id.toString(),
            amount: {
              ...money(order.totalAmount),
              breakdown: {
                itemTotal: money(order.itemsPrice),
                shipping: money(order.shippingPrice),
                taxTotal: money(order.taxPrice),
              },
            },
            items: order.items.map((item) => ({
              name: variantName(item).slice(0, 127),
              unitAmount: money(item.price),
              quantity: String(item.quantity),
            })),
          },
        ],
        paymentSource: {
          paypal: {
            experienceContext: {
              returnUrl: `${clientUrl()}/orders/${order._id}`,
              cancelUrl: `${clientUrl()}/orders/${order._id}`,
              userAction: 'PAY_NOW',
            },
          },
        },
      },
    });

    const approval = result.result.links.find((link) => ['approve', 'payer-action'].includes(link.rel));
    res.status(200).json({ id: result.result.id, url: approval?.href });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/paypal/capture
exports.capturePayPalOrder = async (req, res, next) => {
  try {
    if (!ordersController) return res.status(503).json({ message: 'PayPal is not configured on this server' });

    const order = await loadPayableOrder(req, res, 'paypal');
    if (!order) return;

    const { result } = await ordersController.captureOrder({
      id: req.body.paypalOrderId,
      prefer: 'return=representation',
    });

    if (result.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'PayPal payment was not completed' });
    }

    await markPaid(order, {
      id: result.id,
      status: result.status,
      update_time: new Date().toISOString(),
      email_address: result.payer?.emailAddress,
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
