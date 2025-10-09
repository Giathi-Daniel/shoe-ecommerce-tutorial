const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Security & Middleware
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const morgan = require('morgan');
//const mongoSanitize = require('express-mongo-sanitize');

// Custom Middleware
const errorHandler = require('./middleware/errorHandler');
const csrfVerify = require('./middleware/csrfProtection');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://shoe-ecommerce-tutorial.vercel.app'
];

// --- Middleware Setup ---

// CORS configuration
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

app.use(cookieParser());

// Security Middlewares
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
      "connect-src": ["'self'", "https://api.stripe.com"]
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

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('tiny'));
}

// Request parsing & security
app.use(express.json()); // for parsing JSON request bodies
app.use(hpp()); // HTTP Parameter Pollution protection
//app.use(mongoSanitize({ replaceWith: '_' })); // Sanitizing inputs
 
// Rate limiting for /api routes
app.use('/api', apiLimiter);

// --- CSRF Token Endpoint ---
// Expose CSRF token and set cookie
app.get('/api/csrf-token', (req, res) => {
  let csrfToken = req.cookies.csrfToken;

  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.cookie('csrfToken', csrfToken, {
    httpOnly: false, 
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 
  });

  // Send token in header and JSON response
  res.setHeader('X-CSRF-Token', csrfToken);
  res.json({ csrfToken });
});

// --- CSRF Verification Middleware ---
app.use(csrfVerify);

// --- CSP Reporting Route ---
app.post('/csp-report', express.json({ type: ['json', 'application/csp-report'] }), (req, res) => {
  console.error('CSP Violation:', req.body);
  res.status(204).end();
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/payments', require('./routes/paymentRoutes')); 

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});