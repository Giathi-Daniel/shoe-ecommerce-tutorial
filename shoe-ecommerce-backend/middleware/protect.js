const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: 'Not authorized, token missing' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid or expired' })
    }
};

module.exports = protect;