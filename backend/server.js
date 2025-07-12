const expres = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

const app = expres()

// Middleware
app.use(expres.json())
app.use(cors())
app.use(helmet())

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error("MongoDB connection error", err))

// Routes
app.get('/', (req, res) => {
    res.send("Shoe E-commerce API is running...")
})

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})