const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// ----------------------
//  Security & Middleware
// ----------------------
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const morgan = require('morgan');
// const mongoSanitize = require('express-mongo-sanitize');

// ----------------------
// Custom Middleware
// ----------------------
const errorHandler = require('./middleware/errorHandler');
const csrfVerify = require('./middleware/csrfProtection');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// ----------------------
// Environment Setup
// ----------------------
dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://shoe-ecommerce-tutorial.vercel.app'
];

// ----------------------
// CORS Setup
// ----------------------
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ----------------------
// Cookie Parser 
// ----------------------
app.use(cookieParser());

// Expose CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  let csrfToken = req.cookies.csrfToken;

  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, 
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  res.json({ csrfToken });
});

// Verify CSRF for state-changing methods
app.use(csrfVerify);

// ----------------------
// Helmet Security Config
// ----------------------
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "https://your-image-cdn.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "frame-src": ["'self'", "https://js.stripe.com"],
      "connect-src": ["'self'", "https://api.stripe.com"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(helmet.crossOriginResourcePolicy({ policy: "same-site" }));
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());

// ----------------------
// Logger (Morgan)
// ----------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
} else {
  app.use(morgan('tiny'));
}

// ----------------------
// Additional Middleware
// ----------------------
app.use(express.json());
app.use(hpp());
// app.use(mongoSanitize({ replaceWith: '_' }))

// ----------------------
// Rate Limiting
// ----------------------
app.use('/api', apiLimiter);

// ----------------------
// Stripe/PayPal Webhooks 
// ----------------------
// app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
// app.use('/api/paypal', paypalRoutes);

// ----------------------
// CSP Reporting Route
// ----------------------
app.post('/csp-report', express.json({ type: ['json', 'application/csp-report'] }), (req, res) => {
  console.error('CSP Violation:', req.body);
  res.status(204).end();
});

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error("MongoDB connection error", err));

// ----------------------
// Routes
// ----------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/payments', require('./routes/paymentRoutes'));

// ----------------------
// Error Handler
// ----------------------
app.use(errorHandler);

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
