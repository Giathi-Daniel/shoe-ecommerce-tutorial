const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const crypto = require('crypto'); 
const errorHandler = require('./middleware/errorHandler')
const morgan = require('morgan')
// const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp');
const { apiLimiter } = require('./middleware/rateLimiter');
const csrfVerify = require('./middleware/csrfProtection')
const logger = require('./utils/logger')
// const paypalRoutes = require('./routes/paypalRoutes')

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://shoe-ecommerce-tutorial.vercel.app' 
];

dotenv.config()

const app = express()

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
}));

// Middleware
app.use(cookieParser())

// set CSRF token
app.use((req, res, next) => {
  if (!req.cookies.csrfToken) {
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('csrfToken', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  next();
});

app.use(csrfVerify)

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://js.stripe.com", // allow Stripe scripts
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "img-src": ["'self'", "data:", "https://your-image-cdn.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "frame-src": ["'self'", "https://js.stripe.com"],
        "connect-src": ["'self'", "https://api.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false
}))
app.use(helmet.crossOriginResourcePolicy({ policy: "same-site" }));
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());

if (process.env.NODE_ENV === 'development') {
    app.use(
        morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
        })
    );
} else {
    app.use(morgan('tiny'));
}

// Raw body  for stripe webhook
// app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
// app.use(mongoSanitize({
//     replaceWith: '_'
// })) 
app.use(express.json())
app.use(hpp()) 

app.use('/api', apiLimiter)

// Payment routes
// const paymentRoutes = require('./routes/paymentRoutes')
// app.use('/api/payments', paymentRoutes)

// app.use('/api/paypal', paypalRoutes)

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error("MongoDB connection error", err))

// route for csp reporting
app.post('/csp-report', express.json({ type: ['json', 'application/csp-report'] }), (req, res) => {
    console.error('CSP Violation:', req.body);
    res.status(204).end()
})

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/wishlist', require('./routes/wishlistRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))

// Err Handler
app.use(errorHandler)

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})