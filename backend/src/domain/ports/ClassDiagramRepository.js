/**
 * ClassDiagramRepository Interface (Port)
 * Defines contract for ClassDiagram data access operations
 */
const createClassDiagramRepository = (implementation) => ({
  findById: (id) => implementation.findById(id),
  findByProjectId: (projectId) => implementation.findByProjectId(projectId),
  save: (diagram) => implementation.save(diagram),
  update: (id, diagram) => implementation.update(id, diagram),
  delete: (id) => implementation.delete(id),
  deleteByProjectId: (projectId) => implementation.deleteByProjectId(projectId),
});

module.exports = createClassDiagramRepository;
