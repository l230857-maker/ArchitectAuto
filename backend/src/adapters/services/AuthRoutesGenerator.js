/**
 * Auth Routes Generator
 * 
 * Generates authRoutes.js which defines public authentication endpoints.
 * These endpoints do NOT require authentication (they are for signup/signin).
 */

const AuthRoutesGenerator = {
  /**
   * Generate the authRoutes.js file
   * 
   * @returns {Array} Array with single file object containing auth routes
   */
  generate: () => {
    const files = [];

    try {
      const content = AuthRoutesGenerator.generateAuthRoutesContent();
      files.push({
        path: 'backend/src/routes/authRoutes.js',
        content,
      });
    } catch (error) {
      console.error('Error generating auth routes:', error.message);
    }

    return files;
  },

  /**
   * Generate the content of authRoutes.js
   * 
   * @returns {string} Auth routes content
   */
  generateAuthRoutesContent: () => {
    const content = `/**
 * Authentication Routes
 * 
 * Public routes for user signup and signin.
 * These routes do NOT require authentication.
 * 
 * Generated for authentication system.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

/**
 * Sign up a new user
 * 
 * @route POST /api/auth/signup
 * @access Public (no authentication required)
 * @param {Object} body - Request body
 * @param {string} body.email - User email (must be unique)
 * @param {string} body.password - User password (min 6 characters)
 * @returns {201} User object and JWT token
 * @example
 * curl -X POST http://localhost:5000/api/auth/signup \\
 *   -H "Content-Type: application/json" \\
 *   -d '{"email": "user@example.com", "password": "pass123"}'
 */
router.post('/signup', authController.signup);

/**
 * Sign in existing user
 * 
 * @route POST /api/auth/signin
 * @access Public (no authentication required)
 * @param {Object} body - Request body
 * @param {string} body.email - User email
 * @param {string} body.password - User password
 * @returns {200} User object and JWT token
 * @example
 * curl -X POST http://localhost:5000/api/auth/signin \\
 *   -H "Content-Type: application/json" \\
 *   -d '{"email": "user@example.com", "password": "pass123"}'
 */
router.post('/signin', authController.signin);

module.exports = router;
`;

    return content;
  },
};

module.exports = AuthRoutesGenerator;
