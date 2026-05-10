const createOtherDiagram = ({
  id = null,
  name,
  type,
  projectId,
  visualLayout,
  createdAt = null,
  updatedAt = null,
}) => ({
  id,
  name,
  type,
  projectId,
  visualLayout,
  createdAt,
  updatedAt,
});

module.exports = createOtherDiagram;
