const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fluxora_dev_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user (Seller or Buyer)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, phone, city, state, location } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Role safety: allow seller or buyer registration only (admin seeded or invited)
    const assignedRole = role === 'buyer' ? 'buyer' : 'seller';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      companyName: companyName || '',
      phone,
      city: city || 'Ahmedabad',
      state: state || 'Gujarat',
      location: location || { lat: 23.0225, lng: 72.5714 },
      verificationStatus: 'pending',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        city: user.city,
        verificationStatus: user.verificationStatus,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        phone: user.phone,
        city: user.city,
        state: user.state,
        location: user.location,
        verificationStatus: user.verificationStatus,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, companyName, phone, city, state, location } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (companyName !== undefined) user.companyName = companyName;
    if (phone !== undefined) {
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
      }
      user.phone = phone;
    }
    if (city) user.city = city;
    if (state) user.state = state;
    if (location) user.location = location;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
