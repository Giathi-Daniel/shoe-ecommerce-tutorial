const crypto = require('crypto');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const generateToken = require('../utils/generateToken');
const { handleFailedLogin, resetLoginAttempts } = require('../utils/loginAttempts');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  address: user.address,
  createdAt: user.createdAt,
});

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ email, password, name });
    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user),
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login failed: no user for ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isLocked) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account locked due to multiple failed attempts. Try again in ${waitMinutes} minute(s).`,
      });
    }

    if (!(await user.matchPassword(password))) {
      logger.warn(`Invalid password for ${email}`);
      await handleFailedLogin(user);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await resetLoginAttempts(user);
    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user),
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out' });
};

// GET /api/auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(serializeUser(user));
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, address } = req.body;
    if (name !== undefined) user.name = name;
    if (address) {
      const fields = ['fullName', 'phone', 'address', 'city', 'postalCode', 'country'];
      fields.forEach((field) => {
        if (typeof address[field] === 'string') user.address[field] = address[field].trim();
      });
    }

    await user.save();
    res.status(200).json(serializeUser(user));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  const genericResponse = { message: "If that email is registered, we've sent a password reset link" };

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(200).json(genericResponse);

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: `You requested a password reset.\n\nClick the link below to choose a new password:\n${clientUrl}/reset-password/${resetToken}\n\nThis link expires in 10 minutes. If you did not request it, ignore this email.`,
    });

    res.status(200).json(genericResponse);
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/reset/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    logger.info(`Password reset for ${user.email}`);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/unlock/:userId (admin)
exports.unlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    res.status(200).json({ message: 'User unlocked successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/delete-account
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    await Promise.all([
      Cart.deleteOne({ userId }),
      Wishlist.deleteOne({ userId }),
      Order.deleteMany({ user: userId }),
    ]);

    logger.info(`User ${userId} deleted their account and associated data`);
    res.status(200).json({ message: 'Account and associated data deleted' });
  } catch (err) {
    next(err);
  }
};
