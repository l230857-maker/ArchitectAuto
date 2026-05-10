const createClassDiagram = ({
  id = null,
  name,
  projectId,
  visualLayout,
  structuredUML,
  createdAt = null,
  updatedAt = null,
}) => ({
  id,
  name,
  projectId,
  visualLayout,
  structuredUML,
  createdAt,
  updatedAt,
});

module.exports = createClassDiagram;
