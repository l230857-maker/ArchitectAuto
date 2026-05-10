const createProject = ({
  id = null,
  name,
  stack_name,
  userId,
  classDiagramId = null,
  otherDiagramIds = [],
  createdAt = null,
  updatedAt = null,
}) => ({
  id,
  name,
  stack_name,
  userId,
  classDiagramId,
  otherDiagramIds,
  createdAt,
  updatedAt,
});

module.exports = createProject;
