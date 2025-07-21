const User = require('../models/User')
const generateToken = require('../utils/generateToken');
const { handleFailedLogin, resetLoginAttempts } = require('../utils/loginAttempts');

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

        // check lock status
        if(user.isLocked) {
            const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000)
            return res.status(423).json({
                message: `Account locked due to multiple failed attempts. Try again in ${waitMinutes} minutes(s).`
            })
        }

        if(!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch) {
            await handleFailedLogin(user);
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        await resetLoginAttempts(user); //reset on success
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

exports.unlockUser = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await User.findById(userId)

        if(!user) return res.status(404).json({ message: 'User not found' })

        user.loginAttempts = 0
        user.lockUntil = undefined;
        await user.save()

        res.status(200).json({ message: 'User unlocked successfully' })
    } catch(err) {
        next(err)
    }
}