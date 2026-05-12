/**
 * User Model Generator
 * 
 * Generates a User model for authentication system.
 * This model stores user accounts with email and hashed passwords.
 * It is separate from any UML classes and is built-in for authentication.
 */

const UserModelGenerator = {
  /**
   * Generate the User.js model file for authentication
   * 
   * @returns {Array} Array with single file object containing User model
   */
  generate: () => {
    const files = [];

    try {
      const content = UserModelGenerator.generateUserModelContent();
      files.push({
        path: 'backend/src/models/User.js',
        content,
      });
    } catch (error) {
      console.error('Error generating User model:', error.message);
    }

    return files;
  },

  /**
   * Generate the content of User.js model
   * 
   * @returns {string} User model content
   */
  generateUserModelContent: () => {
    const content = `/**
 * User Model
 * 
 * Stores user account information for authentication system.
 * Passwords are hashed using bcrypt before storage.
 * 
 * @typedef {Object} User
 * @property {string} email - Unique email address (required, indexed for fast lookup)
 * @property {string} password - Hashed password using bcrypt (required)
 * @property {Date} createdAt - Account creation timestamp (auto-generated)
 * @property {Date} updatedAt - Account last update timestamp (auto-generated)
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please provide a valid email address'],
    index: true, // Index for fast email lookups
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Never return password in queries by default
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

/**
 * User Model
 * 
 * @typedef {Object} User
 * @property {string} _id - MongoDB ObjectId
 * @property {string} email - Unique email address
 * @property {string} password - Hashed password (not returned by default)
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
module.exports = mongoose.model('User', UserSchema);
`;

    return content;
  },
};

module.exports = UserModelGenerator;
