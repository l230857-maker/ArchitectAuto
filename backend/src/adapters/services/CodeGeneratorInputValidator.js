const InputValidator = {
  validateDiagram: (structuredUML) => {
    const errors = [];

    if (!structuredUML) {
      errors.push('Structured UML data is required');
      return { valid: false, errors };
    }

    const { classes, relationships } = structuredUML;

    // Check if classes exist and has at least one class
    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      errors.push('Diagram must contain at least one class');
      return { valid: false, errors };
    }

    // Check for duplicate class names
    const classNames = classes.map((c) => c.name);
    const uniqueNames = new Set(classNames);
    if (classNames.length !== uniqueNames.size) {
      const duplicates = classNames.filter((name, index) => classNames.indexOf(name) !== index);
      errors.push(`Duplicate class names found: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Validate each class
    classes.forEach((cls, index) => {
      if (!cls.id) {
        errors.push(`Class at index ${index} is missing id`);
      }
      if (!cls.name) {
        errors.push(`Class at index ${index} is missing name`);
      }
      if (!Array.isArray(cls.attributes)) {
        errors.push(`Class "${cls.name}" attributes must be an array`);
      } else {
        cls.attributes.forEach((attr, attrIndex) => {
          if (!attr.name) {
            errors.push(`Class "${cls.name}" attribute at index ${attrIndex} is missing name`);
          }
          if (!attr.type) {
            errors.push(`Class "${cls.name}" attribute "${attr.name}" is missing type`);
          }
        });
      }
      if (!Array.isArray(cls.methods)) {
        errors.push(`Class "${cls.name}" methods must be an array`);
      }
    });

    // Validate relationships if they exist
    if (relationships && Array.isArray(relationships)) {
      relationships.forEach((rel, index) => {
        if (!rel.from || !rel.to) {
          errors.push(`Relationship at index ${index} is missing from or to`);
          return;
        }

        // Check if both classes exist
        const fromExists = classes.some((c) => c.id === rel.from);
        const toExists = classes.some((c) => c.id === rel.to);

        if (!fromExists) {
          errors.push(`Relationship at index ${index} references non-existent class id: ${rel.from}`);
        }
        if (!toExists) {
          errors.push(`Relationship at index ${index} references non-existent class id: ${rel.to}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

module.exports = InputValidator;
