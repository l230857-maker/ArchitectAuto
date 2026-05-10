const ControllerGenerator = {
  toPascalCase: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  generate: (classes, relationships = []) => {
    const files = [];

    classes.forEach((cls) => {
      try {
        const content = ControllerGenerator.generateControllerContent(cls, relationships, classes);
        const pascalCaseName = ControllerGenerator.toPascalCase(cls.name);
        files.push({
          path: `backend/src/controllers/${pascalCaseName}Controller.js`,
          content,
        });
      } catch (error) {
        console.error(`Error generating controller for class ${cls.name}:`, error.message);
      }
    });

    return files;
  },

  generateControllerContent: (cls, relationships = [], allClasses = []) => {
    const className = ControllerGenerator.toPascalCase(cls.name);
    const modelName = className; // PascalCase for model import
    const variableName = className.charAt(0).toLowerCase() + className.slice(1); // camelCase for instances

    // Generate validation function
    const validationFunction = ControllerGenerator.generateValidationFunction(className, cls.attributes || []);

    // Find what models reference this model (for cascade delete)
    const referencingModels = ControllerGenerator.findReferencingModels(cls.id, relationships, allClasses);
    const cascadeDeleteCode = ControllerGenerator.generateCascadeDeleteCode(className, referencingModels);

    // Find what models this class references (for populate support)
    const referencedModels = ControllerGenerator.findReferencedModels(cls.id, relationships, allClasses);
    // Find what models reference this class (for virtual populate support)
    const populateHelper = ControllerGenerator.generatePopulateHelper(referencedModels, referencingModels);

    // Generate sanitization function
    const sanitizationFunction = ControllerGenerator.generateSanitizationFunction(className, cls.attributes || []);

    // Build all model imports (both referenced and referencing models)
    const allImportsSet = new Set();
    
    // Add referenced models (models this class points to)
    if (referencedModels && referencedModels.length > 0) {
      referencedModels.forEach(m => {
        allImportsSet.add(`const ${m.className} = require('../models/${m.className}');`);
      });
    }
    
    // Add referencing models (models that point to this class)
    if (referencingModels && referencingModels.length > 0) {
      referencingModels.forEach(m => {
        allImportsSet.add(`const ${m.className} = require('../models/${m.className}');`);
      });
    }
    
    const allImportsStr = allImportsSet.size > 0 
      ? Array.from(allImportsSet).join('\n') 
      : '';

    const content = `/**
 * ${className} Controller
 * 
 * Handles CRUD operations for ${className} entities.
 * Generated from UML class diagram.
 */

const ${modelName} = require('../models/${modelName}');
${allImportsStr ? allImportsStr : ''}

${validationFunction}

${sanitizationFunction}

${cascadeDeleteCode}

${populateHelper}

/**
 * Create a new ${className}
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with ${className} data
 * @param {Object} res - Express response object
 * @returns {201} Created ${className} document
 */
const create = async (req, res) => {
  try {
    // Sanitize input data (whitelist allowed fields)
    const sanitizedData = sanitizeInput(req.body);

    // Validate input data
    const validation = validateInput(sanitizedData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Add userId from authenticated user
    const data = {
      ...sanitizedData,
      userId: req.userId,
    };

    const ${variableName} = new ${modelName}(data);
    await ${variableName}.save();
    res.status(201).json({
      success: true,
      data: ${variableName},
      message: '${className} created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create ${className}',
      error: error.message,
    });
  }
};

/**
 * Get all ${className} documents (with pagination and optional relationship population)
 * @param {Object} req - Express request object
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 10, max: 100)
 * @param {string} req.query.populate - Comma-separated list of fields to populate (optional)
 * @param {Object} res - Express response object
 * @returns {200} Paginated array of ${className} documents owned by user
 */
const getAll = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Only return documents owned by the authenticated user
    const query = { userId: req.userId };

    // Get total count for pagination metadata
    const total = await ${modelName}.countDocuments(query);
    
    // Build query with optional population
    let queryBuilder = ${modelName}
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Apply population if requested
    queryBuilder = applyPopulation(queryBuilder, req.query.populate);

    // Get paginated results
    const ${variableName}s = await queryBuilder;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: ${variableName}s,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      message: '${className} documents retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ${className} documents',
      error: error.message,
    });
  }
};

/**
 * Get a specific ${className} by ID (with optional relationship population)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ${className} document ID
 * @param {string} req.query.populate - Comma-separated list of fields to populate (optional)
 * @param {Object} res - Express response object
 * @returns {200} ${className} document or {404} if not found or {403} if not owned
 */
const getById = async (req, res) => {
  try {
    let query = ${modelName}.findById(req.params.id);

    // Apply population if requested
    query = applyPopulation(query, req.query.populate);

    const ${variableName} = await query;

    if (!${variableName}) {
      return res.status(404).json({
        success: false,
        message: '${className} not found',
      });
    }

    // Check ownership
    if (${variableName}.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this document',
      });
    }

    res.status(200).json({
      success: true,
      data: ${variableName},
      message: '${className} retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ${className}',
      error: error.message,
    });
  }
};

/**
 * Update a specific ${className} by ID
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ${className} document ID
 * @param {Object} req.body - Updated ${className} data
 * @param {Object} res - Express response object
 * @returns {200} Updated ${className} document or {403} if not owned
 */
const update = async (req, res) => {
  try {
    // Sanitize input data (whitelist allowed fields)
    const sanitizedData = sanitizeInput(req.body);

    // Validate input data
    const validation = validateInput(sanitizedData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // First, check if document exists and user owns it
    const existingDocument = await ${modelName}.findById(req.params.id);
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: '${className} not found',
      });
    }

    // Check ownership
    if (existingDocument.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this document',
      });
    }

    const ${variableName} = await ${modelName}.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: ${variableName},
      message: '${className} updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update ${className}',
      error: error.message,
    });
  }
};

/**
 * Delete a specific ${className} by ID
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ${className} document ID
 * @param {Object} res - Express response object
 * @returns {204} No content on successful deletion or {403} if not owned
 */
const delete_ = async (req, res) => {
  try {
    // First, check if document exists and user owns it
    const existingDocument = await ${modelName}.findById(req.params.id);
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: '${className} not found',
      });
    }

    // Check ownership
    if (existingDocument.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document',
      });
    }

    // Handle cascade delete for related documents
    ${referencingModels.length > 0 ? `await handleCascadeDelete(req.params.id);` : '// No cascade delete needed'}

    await ${modelName}.findByIdAndDelete(req.params.id);
    // Return 204 No Content - successful deletion requires no response body
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete ${className}',
      error: error.message,
    });
  }
};

${ControllerGenerator.generateCustomMethods(cls, relationships, allClasses, referencingModels, referencedModels)}

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: delete_,
${ControllerGenerator.generateCustomMethodExports(cls)}
};
`;

    return content;
  },

  generateCustomMethods: (cls, relationships = [], allClasses = [], referencingModels = [], referencedModels = []) => {
    if (!cls.methods || !Array.isArray(cls.methods) || cls.methods.length === 0) {
      return '';
    }

    const className = ControllerGenerator.toPascalCase(cls.name);
    const modelName = className; // PascalCase for model reference
    const variableName = className.charAt(0).toLowerCase() + className.slice(1);
    const methods = cls.methods.map((method) => {
      // Remove parentheses from method name if present
      const cleanMethodName = method.name.replace(/[()]/g, '');
      const returnType = method.returnType || 'void';
      
      // Generate meaningful logic based on method name, return type, and relationships
      let methodBody = ControllerGenerator.generateMethodLogic(cleanMethodName, className, variableName, returnType, modelName, referencingModels, referencedModels, allClasses);
      
      return `/**
 * ${cleanMethodName} custom method
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ${className} document ID
 * @param {Object} req.body - Request body with method parameters
 * @param {Object} res - Express response object
 * @returns {200} Result of ${cleanMethodName} operation
 * @returns {403} Forbidden - You don't own this document
 */
const ${cleanMethodName} = async (req, res) => {
  try {
    const id = req.params.id;
    const ${variableName} = await ${modelName}.findById(id);
    
    if (!${variableName}) {
      return res.status(404).json({
        success: false,
        message: '${className} not found',
      });
    }

    // Check ownership
    if (${variableName}.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to execute this method on this document',
      });
    }

    ${methodBody}
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to execute ${cleanMethodName}',
      error: error.message,
    });
  }
};`;
    });

    return methods.join('\n\n');
  },

  generateCustomMethodExports: (cls) => {
    if (!cls.methods || !Array.isArray(cls.methods) || cls.methods.length === 0) {
      return '';
    }

    const exports = cls.methods.map((method) => {
      // Remove parentheses from method name if present
      const cleanMethodName = method.name.replace(/[()]/g, '');
      return `  ${cleanMethodName},`;
    }).join('\n');
    return '\n' + exports;
  },

  generateValidationFunction: (className, attributes) => {
    if (!attributes || attributes.length === 0) {
      return `/**
 * Validate input data for ${className}
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
const validateInput = (data) => {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
};`;
    }

    // Generate validation rules for each attribute
    const validationRules = attributes.map((attr) => {
      const fieldName = attr.name;
      const fieldType = (attr.type || 'string').toLowerCase();
      let validation = `  if (data.${fieldName} !== undefined) {`;

      if (fieldType === 'number' || fieldType === 'int') {
        validation += `
    if (typeof data.${fieldName} !== 'number') {
      errors.push('${fieldName} must be a number');
    }`;
      } else if (fieldType === 'boolean') {
        validation += `
    if (typeof data.${fieldName} !== 'boolean') {
      errors.push('${fieldName} must be a boolean');
    }`;
      } else if (fieldType === 'date') {
        validation += `
    if (!(data.${fieldName} instanceof Date) && typeof data.${fieldName} !== 'string') {
      errors.push('${fieldName} must be a valid date');
    }`;
      } else {
        // String or unknown types
        validation += `
    if (typeof data.${fieldName} !== 'string') {
      errors.push('${fieldName} must be a string');
    }`;
      }

      validation += `
  }`;
      return validation;
    }).join('\n');

    return `/**
 * Validate input data for ${className}
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
const validateInput = (data) => {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return { valid: false, errors };
  }

${validationRules}

  return { valid: errors.length === 0, errors };
};`;
  },

  generateSanitizationFunction: (className, attributes) => {
    if (!attributes || attributes.length === 0) {
      return `/**
 * Sanitize input data for ${className}
 * Whitelist allowed fields to prevent injection of unexpected properties
 * @param {Object} data - Raw request body data
 * @returns {Object} Sanitized data with only allowed fields
 */
const sanitizeInput = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  // No attributes defined, return empty object
  return {};
};`;
    }

    const allowedFields = attributes.map(attr => `'${attr.name}'`).join(', ');
    
    return `/**
 * Sanitize input data for ${className}
 * Whitelist allowed fields to prevent injection of unexpected properties
 * @param {Object} data - Raw request body data
 * @returns {Object} Sanitized data with only allowed fields
 */
const sanitizeInput = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  // Define allowed fields for ${className}
  const allowedFields = [${allowedFields}];
  
  // Filter data to include only allowed fields
  const sanitized = {};
  allowedFields.forEach(field => {
    if (field in data) {
      sanitized[field] = data[field];
    }
  });
  
  return sanitized;
};`;
  },

  generateReturnValue: (returnType) => {
    const lowerType = (returnType || 'void').toLowerCase();
    
    if (lowerType === 'boolean') {
      return 'true';
    }
    if (lowerType === 'string') {
      return '\'\'';
    }
    if (lowerType === 'number' || lowerType === 'int') {
      return '0';
    }
    if (lowerType === 'date') {
      return 'new Date()';
    }
    if (lowerType === 'array') {
      return '[]';
    }
    if (lowerType === 'object') {
      return '{}';
    }
    
    return 'null';
  },

  generateMethodLogic: (methodName, className, variableName, returnType, modelName, referencingModels = [], referencedModels = [], allClasses = []) => {
    const lowerType = (returnType || 'void').toLowerCase();
    const isBoolean = lowerType === 'boolean';
    
    // Generate logic based on method name pattern
    const methodLower = methodName.toLowerCase();
    
    if (methodLower.includes('add')) {
      // For add* methods - accept input and add referenced document
      let targetModelInfo = null;
      let isForwardReference = false;
      
      // Remove "add" prefix to get the potential target model name
      let potentialModelName = methodName.substring(3);
      
      // --- CASE 1: Method name matches current class (e.g., addOrder on Order, addProduct on Product) ---
      if (potentialModelName.toLowerCase() === className.toLowerCase()) {
        // Try to find a model that this class references (forward reference)
        // Example: Product references Order -> target is Order
        if (referencedModels && referencedModels.length > 0) {
          targetModelInfo = referencedModels[0];
          if (targetModelInfo) {
            isForwardReference = true; // Current document will be updated
          }
        }
        // If none, try models that reference this class (reverse reference)
        // Example: Order is referenced by Product -> target is Product
        else if (referencingModels && referencingModels.length > 0) {
          targetModelInfo = referencingModels[0];
          if (targetModelInfo) {
            isForwardReference = false; // Target document will be updated
          }
        }
      }
      
      // --- CASE 2 & 3: Method name indicates a specific model (different from current class) ---
      if (!targetModelInfo) {
        // First, check if this class references that model (forward reference)
        targetModelInfo = referencedModels.find(m => 
          m.className.toLowerCase() === potentialModelName.toLowerCase()
        );
        if (targetModelInfo) {
          isForwardReference = true;
        }
      }
      
      if (!targetModelInfo) {
        // Then, check if that model references this class (reverse reference)
        targetModelInfo = referencingModels.find(m => 
          m.className.toLowerCase() === potentialModelName.toLowerCase()
        );
        if (targetModelInfo) {
          isForwardReference = false;
        }
      }
      
      // If we found a target model, generate the smart code
      if (targetModelInfo) {
        const targetModelName = targetModelInfo.className;
        const targetModelLower = targetModelName.charAt(0).toLowerCase() + targetModelName.slice(1);
        
        if (isForwardReference) {
          // Current document has a field pointing to the target (e.g., Product.orderId)
          // The current document (variableName) will be updated to reference the target
          const refIdField = targetModelInfo.fieldName;
          const refIdParam = `${targetModelLower}Id`;
          
          return `// Extract the ${targetModelName} ID to add
    const { ${refIdParam} } = req.body;
    
    if (!${refIdParam}) {
      return res.status(400).json({
        success: false,
        message: '${refIdParam} is required',
      });
    }
    
    try {
      const ${targetModelLower} = await ${targetModelName}.findById(${refIdParam});
      if (!${targetModelLower}) {
        return res.status(404).json({
          success: false,
          message: '${targetModelName} not found',
        });
      }
      
      if (${variableName}.${refIdField} && ${variableName}.${refIdField}.toString() === ${targetModelLower}._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Already associated',
        });
      }
      
      ${variableName}.${refIdField} = ${targetModelLower}._id;
      await ${variableName}.save();
      
      const result = ${isBoolean ? 'true' : `{ success: true, ${targetModelLower}Id: ${refIdParam} }`};
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${targetModelName} added successfully',
      });
    } catch (innerError) {
      res.status(500).json({
        success: false,
        message: 'Failed to add ${targetModelName}',
        error: innerError.message,
      });
    }`;
        } else {
          // Target document references this class (e.g., Product references Order)
          // The target document will be updated to point to this document
          const refIdField = `${className.charAt(0).toLowerCase()}${className.slice(1)}Id`;
          const refIdParam = `${className.toLowerCase()}Id`;
          
          return `// Extract the ${className} ID to add to ${targetModelName}
    const { ${refIdParam} } = req.body;
    
    if (!${refIdParam}) {
      return res.status(400).json({
        success: false,
        message: '${refIdParam} is required',
      });
    }
    
    try {
      const ${targetModelLower} = await ${targetModelName}.findById(${refIdParam});
      if (!${targetModelLower}) {
        return res.status(404).json({
          success: false,
          message: '${targetModelName} not found',
        });
      }
      
      if (${targetModelLower}.${refIdField} && ${targetModelLower}.${refIdField}.toString() === ${variableName}._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Already associated',
        });
      }
      
      ${targetModelLower}.${refIdField} = ${variableName}._id;
      await ${targetModelLower}.save();
      
      const result = ${isBoolean ? 'true' : `{ success: true, ${targetModelLower}Id: ${refIdParam} }`};
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${targetModelName} associated successfully',
      });
    } catch (innerError) {
      res.status(500).json({
        success: false,
        message: 'Failed to associate',
        error: innerError.message,
      });
    }`;
        }
      }
      
      // Fallback for add* methods without clear relationships
      return `// Extract input parameters from request body
    const { /* Add your parameter names here */ } = req.body;
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required for ${methodName}',
      });
    }
    
    if (!${variableName}) {
      return res.status(400).json({
        success: false,
        message: '${className} not found or invalid state',
      });
    }
    
    try {
      // TODO: Implement your business logic here
      const updates = { /* Define which fields to update */ };
      Object.assign(${variableName}, updates);
      await ${variableName}.save();
      
      const result = ${isBoolean ? 'true' : 'updates'};
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${methodName} executed successfully on ${className}',
      });
    } catch (innerError) {
      res.status(500).json({
        success: false,
        message: 'Failed to execute ${methodName}',
        error: innerError.message,
      });
    }`;
    } else if (methodLower.includes('remove') || methodLower.includes('delete')) {
      // For remove/delete methods - remove related data
      return `// Extract parameters from request (item ID, field name, etc.)
    const { /* Add your parameter names here */ } = req.body;
    
    if (!${variableName}) {
      return res.status(400).json({
        success: false,
        message: '${className} not found',
      });
    }
    
    try {
      // TODO: Implement your removal logic here
      // Example: ${variableName}.items.pull(req.body.itemId);
      // Example: await SomeRelatedModel.deleteMany({ parentId: ${variableName}._id });
      // Example: await ${variableName}.save();
      
      const result = ${isBoolean ? 'true' : '{}'};
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${methodName} executed successfully on ${className}',
      });
    } catch (innerError) {
      res.status(500).json({
        success: false,
        message: 'Failed to execute ${methodName}',
        error: innerError.message,
      });
    }`;
    } else if (methodLower.includes('validate') || methodLower.includes('check')) {
      // For validation methods - check document state
      return `// Extract validation criteria from request
    const criteria = req.body || {};
    
    if (!${variableName}) {
      return res.status(404).json({
        success: false,
        data: false,
        message: '${className} not found',
      });
    }
    
    try {
      // TODO: Implement your validation logic here
      // Example: const isValid = ${variableName}.status === 'active' && ${variableName}.quantity > 0;
      // Example: const isValid = ${variableName}.createdAt && moment(${variableName}.createdAt).isAfter(moment().subtract(30, 'days'));
      
      let result = !!${variableName}; // Document exists
      // Add your custom validation checks here
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${methodName} validation result: ' + (result ? 'Valid' : 'Invalid'),
      });
    } catch (innerError) {
      res.status(500).json({
        success: false,
        message: 'Failed to execute ${methodName}',
        error: innerError.message,
      });
    }`;
    }
    
    // Default logic for any other method
    const returnValue = ControllerGenerator.generateReturnValue(returnType);
    return `// Extract input parameters from request body
    const params = req.body || {};
    
    if (!${variableName}) {
      return res.status(404).json({
        success: false,
        message: '${className} not found',
      });
    }
    
    try {
      // TODO: Implement your custom logic here
      // This method receives:
      //   - req.params.id: The document ID
      //   - req.body: Input parameters for the method
      //   - req.userId: The authenticated user ID
      //   - ${variableName}: The ${className} document object
      
      // Validate input if needed
      if (Object.keys(params).length === 0) {
        console.warn('${methodName} called with no parameters');
      }
      
      // Perform the operation
      let result = ${returnValue};
      
      // Example implementations:
      // result = ${variableName}.someProperty > 10;
      // await ${variableName}.save();
      // result = await SomeModel.findById(params.relatedId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${methodName} executed successfully on ${className}',
      });
    } catch (innerError) {
      res.status(500).json({
        success: false,
        message: 'Failed to execute ${methodName}',
        error: innerError.message,
      });
    }`;
  },

  findReferencingModels: (classId, relationships = [], allClasses = []) => {
    // Find all relationships where this class is the "from" (source) side
    // This means other classes reference this one
    const referencingRelationships = relationships.filter(rel => rel.from === classId);
    
    return referencingRelationships.map(rel => {
      const referencingClass = allClasses.find(c => c.id === rel.to);
      if (!referencingClass) return null;
      
      // The field name on the referencing class that stores this class's ID
      // For example, if Order is being deleted and Product references it,
      // the field on Product is "orderId" (the referenced class name in lowercase + Id)
      const sourceClass = allClasses.find(c => c.id === rel.from);
      const referencedFieldName = `${sourceClass.name.charAt(0).toLowerCase()}${sourceClass.name.slice(1)}Id`;
      
      return {
        className: ControllerGenerator.toPascalCase(referencingClass.name),
        classId: referencingClass.id,
        fieldName: referencedFieldName,
      };
    }).filter(Boolean);
  },

  findReferencedModels: (classId, relationships = [], allClasses = []) => {
    // Find all relationships where this class is the "to" (target) side
    // This means this class references other classes
    const referencedRelationships = relationships.filter(rel => rel.to === classId);
    
    return referencedRelationships.map(rel => {
      const referencedClass = allClasses.find(c => c.id === rel.from);
      if (!referencedClass) return null;
      
      return {
        className: ControllerGenerator.toPascalCase(referencedClass.name),
        classId: referencedClass.id,
        fieldName: `${ControllerGenerator.toPascalCase(referencedClass.name).charAt(0).toLowerCase()}${ControllerGenerator.toPascalCase(referencedClass.name).slice(1)}Id`,
        fieldNameCamelCase: ControllerGenerator.toPascalCase(referencedClass.name).charAt(0).toLowerCase() + ControllerGenerator.toPascalCase(referencedClass.name).slice(1),
      };
    }).filter(Boolean);
  },

  generatePopulateHelper: (referencedModels = [], referencingModels = []) => {
    // Build arrays of populatable fields from both forward and reverse relationships
    const forwardFields = referencedModels.map(m => m.fieldNameCamelCase);
    const reverseFields = referencingModels.map(m => `${m.className.charAt(0).toLowerCase()}${m.className.slice(1)}s`);
    const allPopulatableFields = [...forwardFields, ...reverseFields];

    if (allPopulatableFields.length === 0) {
      return `/**
 * Apply population to query based on populate parameter
 * (No relationships to populate)
 */
const applyPopulation = (query, populateParam) => {
  return query;
};`;
    }

    const populatableFieldsStr = allPopulatableFields.map(f => `'${f}'`).join(', ');

    return `/**
 * Apply population to query based on populate parameter
 * 
 * Supports populating: ${allPopulatableFields.join(', ')}
 * 
 * @param {Object} query - Mongoose query object
 * @param {string} populateParam - Comma-separated field names to populate (e.g., "product,order,products")
 * @returns {Object} - Modified query with population applied
 */
const applyPopulation = (query, populateParam) => {
  if (!populateParam) {
    return query;
  }

  // Parse populate parameter into array of field names
  const fieldsToPopulate = populateParam
    .split(',')
    .map(field => field.trim().toLowerCase())
    .filter(field => field.length > 0);

  // Valid fields that can be populated (forward references and virtual reverse references)
  const validFields = [${populatableFieldsStr}];

  // Apply population for each valid field
  fieldsToPopulate.forEach(field => {
    if (validFields.includes(field)) {
      query = query.populate(field);
    }
  });

  return query;
};`;
  },

  generateCascadeDeleteCode: (className, referencingModels) => {
    if (referencingModels.length === 0) {
      return '';
    }

    const cascadeCode = referencingModels.map(model => {
      return `/**
 * Handle cascade delete: Set ${model.fieldName} to null for all ${model.className} documents
 * This maintains referential integrity by clearing foreign key references to deleted documents
 */
const handle${model.className}CascadeDelete = async (${className.toLowerCase()}Id) => {
  try {
    const result = await ${model.className}.updateMany(
      { ${model.fieldName}: ${className.toLowerCase()}Id },
      { $set: { ${model.fieldName}: null } }
    );
    if (result.modifiedCount > 0) {
      console.log('Cascade delete: Updated ' + result.modifiedCount + ' ${model.className} documents');
    }
  } catch (error) {
    console.error('Error handling cascade delete for ${model.className}:', error.message);
    throw error; // Rethrow to fail the delete operation and maintain data integrity
  }
};`;
    }).join('\n\n');

    const handleDeleteFunction = `
/**
 * Handle cascade delete for all related documents
 * Ensures data integrity by clearing all foreign key references before deletion
 */
const handleCascadeDelete = async (${className.toLowerCase()}Id) => {
  try {
    ${referencingModels.map(model => `await handle${model.className}CascadeDelete(${className.toLowerCase()}Id);`).join('\n    ')}
  } catch (error) {
    console.error('Cascade delete failed. Aborting ${className} deletion:', error.message);
    throw error; // Prevent deletion if cascade fails
  }
};`;

    return cascadeCode + handleDeleteFunction;
  },
};

module.exports = ControllerGenerator;