const expres = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler')
const morgan = require('morgan')

dotenv.config()

const app = expres()

// Middleware
app.use(expres.json())
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))
app.use(helmet())
app.use(morgan('dev'))

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error("MongoDB connection error", err))

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/wishlist', require('./routes/wishlistRoutes'))

// Err Handler
app.use(errorHandler)

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})