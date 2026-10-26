const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storage = require('../services/storageService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_cinema_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await storage.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password if not using Mongoose pre-save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await storage.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'user',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to IMovies.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await storage.findUserById(req.user._id);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
