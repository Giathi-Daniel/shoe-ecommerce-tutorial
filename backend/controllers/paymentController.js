const stripe = require('../utils/stripe')
const Order = require('../models/Order')

exports.createCheckoutSession = async(req, res, next) => {
    try {
        const { cartItems } = req.body

        if(!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'No items in cart' })
        }

        // mapping items to stripe
        const lineItems = cartItems.map((item) => ({
            price_date: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.images ? [item.images[0]] : [],
                },
                unit_amount: Math.round(item.price * 100), // converting to cents
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            customer_email: req.user.email,
            metadata: { userId: req.user.id }
        });

        res.status(200).json({ url: session.url })
    } catch(err) {
        next(err)
    }
};

// Handle Payments
exports.stripeWebhook = async(req, res) => {
    const siq = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, siq, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if(event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Payment successful:', session)
    }

    res.status(200).json({ received: true })
}