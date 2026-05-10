const ComponentGenerator = {
  generate: (classes) => {
    const files = [];

    classes.forEach((cls) => {
      try {
        // Generate JSX component
        const componentContent = ComponentGenerator.generateComponentContent(cls);
        const pascalCaseName = ComponentGenerator.toPascalCase(cls.name);
        files.push({
          path: `frontend/src/components/${pascalCaseName}.jsx`,
          content: componentContent,
        });

        // Generate CSS for component
        const cssContent = ComponentGenerator.generateComponentStyles(cls);
        files.push({
          path: `frontend/src/styles/${pascalCaseName}.css`,
          content: cssContent,
        });
      } catch (error) {
        console.error(`Error generating component for class ${cls.name}:`, error.message);
      }
    });

    return files;
  },

  generateComponentContent: (cls) => {
    const className = ComponentGenerator.toPascalCase(cls.name);
    const variableName = className.charAt(0).toLowerCase() + className.slice(1);
    const componentPrefix = ComponentGenerator.toKebabCase(cls.name);

    let fieldsJSX = `      <div className="${componentPrefix}-fields">\n`;
    if (cls.attributes && Array.isArray(cls.attributes)) {
      cls.attributes.forEach((attr) => {
        fieldsJSX += `        <p><strong>${attr.name}:</strong> {${variableName}?.${attr.name} ?? 'N/A'}</p>\n`;
      });
    }
    fieldsJSX += '      </div>';

    const content = `/**
 * ${className} Component
 * 
 * Displays ${className} data in a read-only format.
 * Generated from UML class diagram.
 * 
 * This component is purely presentational and expects parent components
 * to provide data and event handlers.
 * 
 * @component
 * @example
 * const handleSave = () => console.log('Saving...');
 * const handleDelete = () => console.log('Deleting...');
 * return (
 *   <${className}
 *     ${variableName}={{ id: '1', name: 'Example' }}
 *     onSave={handleSave}
 *     onDelete={handleDelete}
 *   />
 * )
 */

import React from 'react';
import PropTypes from 'prop-types';
import './${className}.css';

/**
 * ${className} Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.${variableName} - ${className} data object
 * @param {Function} props.onSave - Callback function when Save button is clicked
 * @param {Function} props.onDelete - Callback function when Delete button is clicked
 * @returns {JSX.Element} Rendered ${className} component
 */
const ${className} = ({ ${variableName}, onSave, onDelete }) => {
  return (
    <div className="${componentPrefix}-container">
      <h2>${className}</h2>
${fieldsJSX}
      <div className="${componentPrefix}-actions">
        <button
          type="button"
          className="${componentPrefix}-save-btn"
          onClick={onSave}
          title="Save ${className}"
        >
          Save
        </button>
        <button
          type="button"
          className="${componentPrefix}-delete-btn"
          onClick={onDelete}
          title="Delete ${className}"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

${className}.propTypes = {
  /**
   * ${className} data object containing the fields
   */
  ${variableName}: PropTypes.shape({
${ComponentGenerator.generatePropTypes(cls)}
  }),
  /**
   * Callback function invoked when the Save button is clicked
   */
  onSave: PropTypes.func.isRequired,
  /**
   * Callback function invoked when the Delete button is clicked
   */
  onDelete: PropTypes.func.isRequired,
};

${className}.defaultProps = {
  ${variableName}: {},
};

export default ${className};
`;

    return content;
  },

  generatePropTypes: (cls) => {
    const lines = [];
    const seenAttributes = new Set();
    
    if (cls.attributes && Array.isArray(cls.attributes)) {
      cls.attributes.forEach((attr) => {
        // Skip duplicates
        if (seenAttributes.has(attr.name)) {
          return;
        }
        seenAttributes.add(attr.name);
        
        const propType = ComponentGenerator.mapToPropType(attr.type);
        lines.push(`    ${attr.name}: ${propType},`);
      });
    }
    return lines.join('\n');
  },

  mapToPropType: (umlType) => {
    const lowerType = (umlType || 'string').toLowerCase();

    if (lowerType === 'string') {
      return 'PropTypes.string';
    }
    if (lowerType === 'number' || lowerType === 'int') {
      return 'PropTypes.number';
    }
    if (lowerType === 'boolean') {
      return 'PropTypes.bool';
    }
    if (lowerType === 'date') {
      return 'PropTypes.instanceOf(Date)';
    }
    if (lowerType === 'array') {
      return 'PropTypes.array';
    }
    if (lowerType === 'object') {
      return 'PropTypes.object';
    }

    return 'PropTypes.string';
  },

  toPascalCase: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  toKebabCase: (str) => {
    if (!str) return '';
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  generateComponentStyles: (cls) => {
    const componentPrefix = ComponentGenerator.toKebabCase(cls.name);

    return `/**
 * ${ComponentGenerator.toPascalCase(cls.name)} Component Styles
 * 
 * Scoped CSS with component-prefixed class names to prevent conflicts
 * when multiple components are used together on the same page.
 * 
 * Generated from UML class diagram.
 */

/* Container for the component */
.${componentPrefix}-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Heading inside the component */
.${componentPrefix}-container h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 8px;
}

/* Fields section - displays data in read-only format */
.${componentPrefix}-fields {
  margin: 16px 0;
  padding: 12px;
  background-color: #ffffff;
  border-left: 4px solid #1976d2;
}

.${componentPrefix}-fields p {
  margin: 8px 0;
  line-height: 1.6;
  color: #333333;
}

.${componentPrefix}-fields strong {
  color: #1976d2;
  font-weight: 600;
  min-width: 120px;
  display: inline-block;
}

/* Actions container - holds buttons */
.${componentPrefix}-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Save button - component-specific */
.${componentPrefix}-save-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.2s ease;
}

.${componentPrefix}-save-btn:hover {
  background-color: #45a049;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.${componentPrefix}-save-btn:active {
  transform: scale(0.98);
}

.${componentPrefix}-save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Delete button - component-specific */
.${componentPrefix}-delete-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.2s ease;
}

.${componentPrefix}-delete-btn:hover {
  background-color: #da190b;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.${componentPrefix}-delete-btn:active {
  transform: scale(0.98);
}

.${componentPrefix}-delete-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Responsive design for mobile devices */
@media (max-width: 600px) {
  .${componentPrefix}-container {
    padding: 16px;
    margin: 12px 0;
  }

  .${componentPrefix}-actions {
    flex-direction: column;
    gap: 8px;
  }

  .${componentPrefix}-save-btn,
  .${componentPrefix}-delete-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
  }

  .${componentPrefix}-fields strong {
    display: block;
    margin-bottom: 4px;
  }
}
`;
  },
};

module.exports = ComponentGenerator;
