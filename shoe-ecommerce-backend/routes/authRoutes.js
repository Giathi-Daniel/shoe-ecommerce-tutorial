const express = require('express')
const router = express.Router()
const { register, login, logout, unlockUser, forgotPassword, resetPassword, changePassword, deleteAccount, getProfile } = require('../controllers/authController')
const validateAuth = require('../middleware/validateInput')
const { loginLimiter } = require('../middleware/rateLimiter')
const adminOnly = require('../middleware/adminOnly')
const protect = require('../middleware/protect')

router.post('/register', validateAuth, register);
router.post('/login', loginLimiter, validateAuth, login);
router.get('/profile', protect, getProfile);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword)
router.put('/reset/:token', resetPassword)
router.put('/change-password', protect, changePassword)
router.patch('/unlock/:userId', protect, adminOnly, unlockUser)
router.delete('/delete-account', protect, deleteAccount )

module.exports = router;