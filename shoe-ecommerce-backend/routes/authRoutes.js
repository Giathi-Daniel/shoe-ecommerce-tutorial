const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateEmail,
  validatePasswordChange,
  validateReset,
} = require('../middleware/validateInput');
const { loginLimiter } = require('../middleware/rateLimiter');
const adminOnly = require('../middleware/adminOnly');
const protect = require('../middleware/protect');

router.post('/register', validateRegister, auth.register);
router.post('/login', loginLimiter, validateLogin, auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', loginLimiter, validateEmail, auth.forgotPassword);
router.put('/reset/:token', validateReset, auth.resetPassword);

router.get('/profile', protect, auth.getProfile);
router.put('/profile', protect, auth.updateProfile);
router.put('/change-password', protect, validatePasswordChange, auth.changePassword);
router.patch('/unlock/:userId', protect, adminOnly, auth.unlockUser);
router.delete('/delete-account', protect, auth.deleteAccount);

module.exports = router;
