const TypeMapper = require('./TypeMapper');

const ModelGenerator = {
  toPascalCase: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  generate: (classes, relationships = []) => {
    const files = [];

    classes.forEach((cls) => {
      try {
        const content = ModelGenerator.generateModelContent(cls, relationships, classes);
        const pascalCaseName = ModelGenerator.toPascalCase(cls.name);
        files.push({
          path: `backend/src/models/${pascalCaseName}.js`,
          content,
        });
      } catch (error) {
        console.error(`Error generating model for class ${cls.name}:`, error.message);
      }
    });

    return files;
  },

  generateModelContent: (cls, relationships = [], allClasses = []) => {
    const className = ModelGenerator.toPascalCase(cls.name);
    const schemaFields = ModelGenerator.buildSchemaFields(cls, relationships, allClasses);
    const methods = ModelGenerator.buildMethods(cls);
    const virtuals = ModelGenerator.buildVirtualPopulates(cls, relationships, allClasses);

    const content = `/**
 * ${className} Model
 * 
 * Generated model for the ${className} entity.
 * Schema fields represent attributes from the UML class diagram.
 */

const mongoose = require('mongoose');

const ${className}Schema = new mongoose.Schema({
${schemaFields}
}, {
  timestamps: true,
});

${methods}

${virtuals}

/**
 * ${className} Model
 * 
 * @typedef {Object} ${className}
${ModelGenerator.generateFieldJSDoc(cls)}
 */
module.exports = mongoose.model('${className}', ${className}Schema);
`;

    return content;
  },

  buildSchemaFields: (cls, relationships = [], allClasses = []) => {
    const fields = [];

    // Add userId field for ownership tracking (required for authorization)
    // Add index for fast queries filtering by userId
    fields.push(`  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },`);

    // Add attributes as schema fields
    if (cls.attributes && Array.isArray(cls.attributes)) {
      cls.attributes.forEach((attr) => {
        const mongooseType = TypeMapper.mapToMongoose(attr.type);
        fields.push(`  ${attr.name}: ${mongooseType},`);
      });
    }

    // Add relationship references (Option B: only on many side)
    // Add index to foreign key fields for faster joins and lookups
    relationships.forEach((rel) => {
      // If this class is the "to" side (many side), add the reference
      if (rel.to === cls.id) {
        // Find the source class by ID to get its actual name
        const sourceClass = allClasses.find((c) => c.id === rel.from);
        if (sourceClass) {
          const fieldName = `${sourceClass.name.charAt(0).toLowerCase()}${sourceClass.name.slice(1)}Id`;
          fields.push(`  ${fieldName}: { type: mongoose.Schema.Types.ObjectId, ref: '${sourceClass.name}', index: true },`);
        }
      }
    });

    return fields.join('\n');
  },

  generateFieldJSDoc: (cls) => {
    const lines = [];

    if (cls.attributes && Array.isArray(cls.attributes)) {
      cls.attributes.forEach((attr) => {
        const jsType = TypeMapper.mapToJSType(attr.type);
        lines.push(` * @property {${jsType}} ${attr.name}`);
      });
    }

    return lines.join('\n');
  },

  buildMethods: (cls) => {
    if (!cls.methods || !Array.isArray(cls.methods) || cls.methods.length === 0) {
      return '';
    }

    const className = ModelGenerator.toPascalCase(cls.name);
    const methodDefs = cls.methods.map((method) => {
      const returnType = method.returnType || 'void';
      const returnStatement = ModelGenerator.generateReturnStatement(returnType);
      
      // Remove parentheses from method name if present
      const cleanMethodName = method.name.replace(/[()]/g, '');
      
      return `/**
 * ${cleanMethodName} method
 * 
 * @returns {${returnType}} ${cleanMethodName} result
 */
${className}Schema.methods.${cleanMethodName} = function() {
  ${returnStatement}
};`;
    });

    return methodDefs.join('\n\n');
  },

  buildVirtualPopulates: (cls, relationships = [], allClasses = []) => {
    // Find all relationships where this class is the "from" (source) side
    // This means other classes reference this one, so we create virtuals for those reverse relationships
    const referencingRelationships = relationships.filter(rel => rel.from === cls.id);
    
    if (referencingRelationships.length === 0) {
      return '';
    }

    const className = ModelGenerator.toPascalCase(cls.name);
    const virtuals = referencingRelationships.map(rel => {
      const referencingClass = allClasses.find(c => c.id === rel.to);
      if (!referencingClass) return null;
      
      const referencingClassName = ModelGenerator.toPascalCase(referencingClass.name);
      // The foreign field name is based on the SOURCE class (cls), not the referencing class
      // Example: If Order (source/from) references Product (referencing/to), 
      // then Product has an orderId field (source class name + Id)
      const sourceClassName = ModelGenerator.toPascalCase(cls.name);
      const fieldName = `${sourceClassName.charAt(0).toLowerCase()}${sourceClassName.slice(1)}Id`;
      const pluralName = `${referencingClass.name.toLowerCase()}s`;
      
      return `/**
 * Virtual populate for related ${referencingClassName} documents
 * References all ${referencingClassName} documents that have this ${className}'s ID in their ${fieldName} field
 */
${className}Schema.virtual('${pluralName}', {
  ref: '${referencingClassName}',
  localField: '_id',
  foreignField: '${fieldName}'
});`;
    }).filter(Boolean);

    if (virtuals.length === 0) {
      return '';
    }

    return virtuals.join('\n\n');
  },

  generateReturnStatement: (returnType) => {
    const lowerType = (returnType || 'void').toLowerCase();
    
    if (lowerType === 'boolean') {
      return 'return true;';
    }
    if (lowerType === 'string') {
      return 'return \'\';';
    }
    if (lowerType === 'number' || lowerType === 'int') {
      return 'return 0;';
    }
    if (lowerType === 'date') {
      return 'return new Date();';
    }
    if (lowerType === 'array') {
      return 'return [];';
    }
    if (lowerType === 'object') {
      return 'return {};';
    }
    if (lowerType === 'void') {
      return '';
    }
    
    return 'return null;';
  },
};

module.exports = ModelGenerator;
