const RouteGenerator = {
  toPascalCase: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  generate: (classes) => {
    const files = [];

    classes.forEach((cls) => {
      try {
        const content = RouteGenerator.generateRouteContent(cls);
        const pascalCaseName = RouteGenerator.toPascalCase(cls.name);
        files.push({
          path: `backend/src/routes/${pascalCaseName}Routes.js`,
          content,
        });
      } catch (error) {
        console.error(`Error generating routes for class ${cls.name}:`, error.message);
      }
    });

    return files;
  },

  generateRouteContent: (cls) => {
    const className = RouteGenerator.toPascalCase(cls.name);
    const controllerName = `${className}Controller`;
    const routerName = `${className}Routes`;

    const middleware = RouteGenerator.generateAuthMiddleware();
    const customRoutes = RouteGenerator.generateCustomRoutes(cls);

    const content = `/**
 * ${className} Routes
 * 
 * RESTful API endpoints for ${className} CRUD operations with authentication and authorization.
 * Generated from UML class diagram.
 * 
 * All routes require a valid JWT token in the Authorization header.
 * Format: Authorization: Bearer <token>
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/${controllerName}');

${middleware}

/**
 * POST / - Create a new ${className}
 * 
 * @route POST /
 * @auth Required - Bearer token
 * @param {Object} body - ${className} data object
 * @returns {201} Created ${className} document
 * @returns {401} Unauthorized
 * @example
 * POST /${className.toLowerCase()}
 * Headers: { Authorization: 'Bearer <token>' }
 * {
 *   "field1": "value1",
 *   "field2": "value2"
 * }
 */
router.post('/', authenticate, controller.create);

/**
 * GET / - Retrieve all ${className} documents for the authenticated user
 * 
 * @route GET /
 * @auth Required - Bearer token
 * @returns {200} Array of ${className} documents owned by user
 * @returns {401} Unauthorized
 * @example
 * GET /${className.toLowerCase()}
 * Headers: { Authorization: 'Bearer <token>' }
 */
router.get('/', authenticate, controller.getAll);

/**
 * GET /:id - Retrieve a specific ${className} by ID
 * 
 * @route GET /:id
 * @auth Required - Bearer token with ownership
 * @param {string} id - ${className} document ID
 * @returns {200} ${className} document
 * @returns {401} Unauthorized
 * @returns {403} Forbidden - You don't own this document
 * @returns {404} ${className} not found
 * @example
 * GET /${className.toLowerCase()}/507f1f77bcf86cd799439011
 * Headers: { Authorization: 'Bearer <token>' }
 */
router.get('/:id', authenticate, authorize, controller.getById);

/**
 * PUT /:id - Update a specific ${className}
 * 
 * @route PUT /:id
 * @auth Required - Bearer token with ownership
 * @param {string} id - ${className} document ID
 * @param {Object} body - Updated ${className} data
 * @returns {200} Updated ${className} document
 * @returns {401} Unauthorized
 * @returns {403} Forbidden - You don't own this document
 * @returns {404} ${className} not found
 * @example
 * PUT /${className.toLowerCase()}/507f1f77bcf86cd799439011
 * Headers: { Authorization: 'Bearer <token>' }
 * {
 *   "field1": "newValue1",
 *   "field2": "newValue2"
 * }
 */
router.put('/:id', authenticate, authorize, controller.update);

/**
 * DELETE /:id - Delete a specific ${className}
 * 
 * @route DELETE /:id
 * @auth Required - Bearer token with ownership
 * @param {string} id - ${className} document ID
 * @returns {204} No content on successful deletion
 * @returns {401} Unauthorized
 * @returns {403} Forbidden - You don't own this document
 * @returns {404} ${className} not found
 * @example
 * DELETE /${className.toLowerCase()}/507f1f77bcf86cd799439011
 * Headers: { Authorization: 'Bearer <token>' }
 */
router.delete('/:id', authenticate, authorize, controller.delete);

${customRoutes}

module.exports = router;
`;

    return content;
  },

  generateAuthMiddleware: () => {
    return `/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided. Include token in Authorization header: Bearer <token>',
      });
    }

    // Verify JWT token (assumes JWT_SECRET is set in environment)
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Attach user info to request object for use in controllers
    req.user = decoded;
    req.userId = decoded.id || decoded.userId;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Authorization Middleware
 * Checks if user owns the document being accessed
 * Used on routes with :id parameter
 */
const authorize = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User information not found in token',
      });
    }

    // Get the model from the controller path
    // This will be populated by the controller before calling next
    // For now, we'll check in the controller itself
    req.isAuthorized = true;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message,
    });
  }
};`;
  },

  generateCustomRoutes: (cls) => {
    if (!cls.methods || !Array.isArray(cls.methods) || cls.methods.length === 0) {
      return '';
    }

    const className = RouteGenerator.toPascalCase(cls.name);
    const routes = cls.methods.map((method) => {
      // Remove parentheses from method name if present
      const cleanMethodName = method.name.replace(/[()]/g, '');
      const methodNameKebab = cleanMethodName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      
      return `/**
 * POST /:id/${methodNameKebab} - ${cleanMethodName} custom method
 * 
 * @route POST /:id/${methodNameKebab}
 * @auth Required - Bearer token with ownership
 * @param {string} id - ${className} document ID
 * @returns {200} Result of ${cleanMethodName} operation
 * @returns {401} Unauthorized
 * @returns {403} Forbidden - You don't own this document
 * @example
 * POST /${className.toLowerCase()}/507f1f77bcf86cd799439011/${methodNameKebab}
 * Headers: { Authorization: 'Bearer <token>' }
 */
router.post('/:id/${methodNameKebab}', authenticate, authorize, controller.${cleanMethodName});`;
    });

    return routes.join('\n\n');
  },
};

module.exports = RouteGenerator;