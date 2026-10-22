const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const generateToken = require('../utils/generateToken');
const { handleFailedLogin, resetLoginAttempts } = require('../utils/loginAttempts');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');
const { maskEmail } = require('../utils/mask');

// Same message for unknown email, wrong password and locked account, so responses never reveal which accounts exist.
const LOGIN_FAILED =
  'Invalid credentials. After 5 failed attempts an account is locked for 10 minutes.';
// Compared against when the email is unknown so response time does not reveal it either.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

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
      await bcrypt.compare(String(password), DUMMY_HASH);
      logger.warn(`Login failed: unknown account ${maskEmail(email)}`);
      return res.status(401).json({ message: LOGIN_FAILED });
    }

    if (user.isLocked) {
      logger.warn(`Login attempt on locked account ${maskEmail(email)}`);
      return res.status(401).json({ message: LOGIN_FAILED });
    }

    if (!(await user.matchPassword(password))) {
      logger.warn(`Login failed: wrong password for ${maskEmail(email)}`);
      await handleFailedLogin(user);
      return res.status(401).json({ message: LOGIN_FAILED });
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
exports.logout = async (req, res, next) => {
  try {
    // Bumping tokenVersion invalidates this token (and any other) immediately
    await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
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
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
        return res.status(400).json({ message: 'Name must be 2-60 characters' });
      }
      user.name = name.trim();
    }
    if (address) {
      const fields = ['fullName', 'phone', 'address', 'city', 'postalCode', 'country'];
      for (const field of fields) {
        if (address[field] === undefined) continue;
        if (typeof address[field] !== 'string' || address[field].length > 200) {
          return res.status(400).json({ message: `Invalid ${field}` });
        }
        user.address[field] = address[field].trim();
      }
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
    user.tokenVersion += 1;
    await user.save();

    logger.info(`Password reset for ${maskEmail(user.email)}`);
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
    user.tokenVersion += 1;
    await user.save();

    // Every other session is signed out; this one continues with a fresh token
    res.status(200).json({ message: 'Password changed successfully', token: generateToken(user) });
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
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof req.body.password !== 'string' || !(await user.matchPassword(req.body.password))) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    await User.deleteOne({ _id: userId });

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
