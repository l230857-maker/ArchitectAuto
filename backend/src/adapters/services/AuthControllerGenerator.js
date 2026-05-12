/**
 * Auth Controller Generator
 * 
 * Generates AuthController.js which handles user signup and signin logic.
 * Uses bcrypt for password hashing and JWT for token generation.
 */

const AuthControllerGenerator = {
  /**
   * Generate the AuthController.js file
   * 
   * @returns {Array} Array with single file object containing auth controller
   */
  generate: () => {
    const files = [];

    try {
      const content = AuthControllerGenerator.generateAuthControllerContent();
      files.push({
        path: 'backend/src/controllers/AuthController.js',
        content,
      });
    } catch (error) {
      console.error('Error generating AuthController:', error.message);
    }

    return files;
  },

  /**
   * Generate the content of AuthController.js
   * 
   * @returns {string} Auth controller content
   */
  generateAuthControllerContent: () => {
    const content = `/**
 * Authentication Controller
 * 
 * Handles user signup and signin operations.
 * - Signup: Creates new user account with hashed password
 * - Signin: Validates credentials and returns JWT token
 * 
 * Generated for authentication system.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token for authenticated user
 * 
 * @param {string} userId - MongoDB User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Sign up a new user account
 * 
 * @route POST /api/auth/signup
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password (min 6 characters)
 * @param {Object} res - Express response object
 * @returns {201} Created user with authentication token
 * @example
 * POST /api/auth/signup
 * Content-Type: application/json
 * 
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "_id": "...", "email": "user@example.com" },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   },
 *   "message": "User created successfully"
 * }
 */
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please sign in instead.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create user account',
      error: error.message,
    });
  }
};

/**
 * Sign in existing user
 * 
 * @route POST /api/auth/signin
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password
 * @param {Object} res - Express response object
 * @returns {200} Authenticated user with token
 * @example
 * POST /api/auth/signin
 * Content-Type: application/json
 * 
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "_id": "...", "email": "user@example.com" },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   },
 *   "message": "User signed in successfully"
 * }
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'User signed in successfully',
    });
  } catch (error) {
    console.error('Signin error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sign in',
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  signin,
  generateToken,
};
`;

    return content;
  },
};

module.exports = AuthControllerGenerator;
