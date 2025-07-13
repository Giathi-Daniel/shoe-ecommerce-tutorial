const User = require('../models/User')
const generateToken = require('../utils/generateToken')

exports.register = async(req, res, next) => {
    try {
        const { email, password, name } = req.body

        const existing = await User.findOne({ email })
        if(existing) {
            return res.status(400).json({ message: 'User already exists'})
        }

        const newUser = await User.create({ email, password, name })
        generateToken(res, newUser._id)
        
        res.status(201).json({ message: 'User registered successfully'})
    } catch(err) {
        next(err)
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password')
        if(!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        generateToken(res, user._id)
        res.status(200).json({ message: 'Login successful'})
    } catch(err) {
        next(err)
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token')
    res.status(200).json({ message: 'Logged out' })
}