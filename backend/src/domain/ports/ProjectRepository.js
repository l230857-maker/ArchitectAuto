/**
 * ProjectRepository Interface (Port)
 * Defines contract for Project data access operations
 */
const createProjectRepository = (implementation) => ({
  findById: (id) => implementation.findById(id),
  findByUserId: (userId) => implementation.findByUserId(userId),
  save: (project) => implementation.save(project),
  update: (id, project) => implementation.update(id, project),
  delete: (id) => implementation.delete(id),
  deleteByUserId: (userId) => implementation.deleteByUserId(userId),
});

module.exports = createProjectRepository;
