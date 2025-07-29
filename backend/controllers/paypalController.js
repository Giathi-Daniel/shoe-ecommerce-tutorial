const paypalClient = require('../utils/paypal')
const paypal = require('@paypal/paypal-server-sdk')
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
        unit_amount: {
          currency_code: 'USD',
          value: product.price.toFixed(2),
        },
        quantity: quantity.toString(),
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2),
              },
            },
          },
          items: validatedItems,
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.status(200).json({ id: order.result.id });

  } catch (err) {
    console.error('PayPal Order Creation Error:', err);
    next(err);
  }
};

exports.captureOrder = async(req, res, next) => {
    try{
        const { orderID } = req.body

        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({})

        const capture = await paypalClient.execute(request);
        res.status(200).json({ details: capture.result })
    } catch (err) {
        console.error('PayPal Error:', err);
        next(err);
    }
};