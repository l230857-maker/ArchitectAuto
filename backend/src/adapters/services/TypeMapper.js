/**
 * Maps UML data types to Mongoose schema types
 * Used by ModelGenerator to convert class attributes to MongoDB schema fields
 */
const TypeMapper = {
  mapToMongoose: (umlType) => {
    if (!umlType) return 'String';

    const type = umlType.toLowerCase().trim();

    const typeMap = {
      string: 'String',
      int: 'Number',
      integer: 'Number',
      number: 'Number',
      float: 'Number',
      double: 'Number',
      boolean: 'Boolean',
      bool: 'Boolean',
      date: 'Date',
      datetime: 'Date',
      array: '[Schema.Types.Mixed]',
      object: 'Schema.Types.Mixed',
      any: 'Schema.Types.Mixed',
      mixed: 'Schema.Types.Mixed',
    };

    return typeMap[type] || 'String';
  },

  mapToJSType: (umlType) => {
    if (!umlType) return 'any';

    const type = umlType.toLowerCase().trim();

    const typeMap = {
      string: 'string',
      int: 'number',
      integer: 'number',
      number: 'number',
      float: 'number',
      double: 'number',
      boolean: 'boolean',
      bool: 'boolean',
      date: 'Date',
      datetime: 'Date',
      array: 'any[]',
      object: 'any',
      any: 'any',
      mixed: 'any',
    };

    return typeMap[type] || 'any';
  },
};

module.exports = TypeMapper;
