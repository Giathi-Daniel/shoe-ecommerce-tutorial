const User = require('../models/User')
const generateToken = require('../utils/generateToken');
const { handleFailedLogin, resetLoginAttempts } = require('../utils/loginAttempts');
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

const Cart = require('../models/Cart');
const Order = require('../models/Order');


exports.register = async(req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({ email, password, name });

    const token = generateToken(res, newUser._id);

    res.status(201).json({
        message: 'User registered successfully',
        token, // Return token for frontend
    });

  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login failed: user not found for email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isLocked) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      logger.warn(`Login attempt for locked account: ${email}`);
      return res.status(423).json({
        message: `Account locked due to multiple failed attempts. Try again in ${waitMinutes} minute(s).`
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn(`Invalid password for email: ${email}`);
      await handleFailedLogin(user);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.info(`User ${email} logged in successfully`);
    await resetLoginAttempts(user);

    const token = generateToken(res, user._id); // updated to return token

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
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

exports.forgotPassword = async(req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if(!user) return res.status(404).json({ message: 'User not found' })

        const resetToken = user.passwordResetToken()
        await user.save({ validateBeforeSave: false })

        const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset/${resetToken}`;
        const message = `You requested a password reset.\n\nClick the link below to reset your password:\n${resetURL}\n\nThis link will expire in 10 minutes.`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
        })

        res.status(200).json({ message: 'We\'ve sent you the password reset link to your email' })
    } catch(err) {
        next(err)
    }
}

exports.resetPassword = async(req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        })

        if(!user) {
            logger.warn(`Invalid or expired reset token used: ${req.params.token}`);
            return res.status(400).json({ message: 'Invalid or expired token' })
        }
        
        if(req.body.password.length < 8) {
            logger.warn(`Password reset failed for ${user.email}: password too short`);
            return res.status(400).json({ message: 'Password must be at least 8 characters' })
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save()

        logger.info(`Password reset successfully for ${user.email}`);
        res.status(200).json({ message: 'Password reset successful' })
    } catch(err) {
        logger.error(`Password reset error: ${err.message}`);
        next(err)
    }
}

exports.changePassword = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password')
        if(!user) return res.status(404).json({ message: 'User not found' })

        const isMatch = await user.matchPassword(req.body.currentPassword)
        if(!isMatch) return res.status(401).json({ message: 'Incorrect currect password' })

        if(req.body.newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be atleast 8 characters' })
        }

        user.password = req.body.newPassword;
        await user.save()

        res.status(200).json({ message: 'Password changed successfully' })
    } catch (err) {
        next(err)
    }
}

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Associated data cleanup
    await Promise.all([
      Cart.deleteOne({ user: userId }),
      Wishlist.deleteOne({ user: userId }),
      Order.deleteMany({ user: userId }) // keep if order history should persist
    ]);

    logger.info(`User ${userId} deleted their account and associated data.`);

    res.clearCookie('token');
    res.status(200).json({ message: 'Account and associated data deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};