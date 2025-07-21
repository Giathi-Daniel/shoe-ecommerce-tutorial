const express = require('express')
const router = express.Router()
const { register, login, logout, unlockUser } = require('../controllers/authController')
const validateAuth = require('../middleware/validateInput')
const loginLimiter = require('../middleware/rateLimiter')
const adminOnly = require('../middleware/adminOnly')

router.post('/register', validateAuth, register);
router.post('/login', loginLimiter, validateAuth, login);
router.post('/logout', logout);
router.patch('/unlock/:userId', protect, adminOnly, unlockUser)

module.exports = router;