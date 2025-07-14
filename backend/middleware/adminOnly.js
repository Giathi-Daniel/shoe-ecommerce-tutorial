const adminOnly = (req, res, next) => {
    if(!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' })
    }
    next();
}

module.exports = adminOnly;