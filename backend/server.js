const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp');
const { apiLimiter } = require('./middleware/rateLimiter');
const csrfVerify = require('./middleware/csrfProtection')

const allowedOrigins = [
    // 'https://not-yet.vercel.app',
    'http://localhost:3000'
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
app.use(express.json())
app.use(cookieParser())

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

app.use(helmet())
app.use(morgan('dev'))
app.use(mongoSanitize()) 
app.use(hpp()) 

app.use('/api', apiLimiter)

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error("MongoDB connection error", err))

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