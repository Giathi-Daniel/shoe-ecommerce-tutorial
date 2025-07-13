const express = require('express')
const router = express.Router()
const { register, login, logout } = require('../controllers/authController')
const validateAuth = require('../middleware/validateInput')
const loginLimiter = require('../middleware/rateLimiter')

router.post('/register', validateAuth, register);
router.post('/login', loginLimiter, validateAuth, login);
router.post('/logout', logout);

module.exports = router;