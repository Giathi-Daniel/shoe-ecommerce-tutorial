const { randomUUID } = require('crypto')
const { ordersController } = require('../utils/paypal')
const Product = require('../models/Product')


exports.createOrder = async (req, res, next) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'No items in the cart' });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const quantity = parseInt(item.quantity, 10);
      const lineAmount = product.price * quantity;
      totalAmount += lineAmount;

      validatedItems.push({
        name: product.name,
        unitAmount: {
          currencyCode: 'USD',
          value: product.price.toFixed(2),
        },
        quantity: quantity.toString(),
      });
    }

    const order = await ordersController.createOrder({
      prefer: 'return=representation',
      paypalRequestId: randomUUID(),
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: totalAmount.toFixed(2),
              breakdown: {
                itemTotal: {
                  currencyCode: 'USD',
                  value: totalAmount.toFixed(2),
                },
              },
            },
            items: validatedItems,
          },
        ],
      },
    });

    res.status(200).json({
        id: order.result.id,
        status: order.result.status,             
        links: order.result.links,               // PayPal approval URLs
        amount: order.result.purchase_units[0].amount, 
    });

  } catch (err) {
    console.error('PayPal Order Creation Error:', err);
    next(err);
  }
};

exports.captureOrder = async(req, res, next) => {
    try{
        const { orderID } = req.body

        const capture = await ordersController.captureOrder({
          id: orderID,
          prefer: 'return=representation',
          body: {},
        });
        res.status(200).json({ details: capture.result })
    } catch (err) {
        console.error('PayPal Error:', err);
        next(err);
    }
};
