const AppError = require('../../domain/errors/AppError');

const createGetProjectsUseCase = ({ projectRepository, classdiagramRepository, otherdiagramRepository }) => ({
  execute: async (userId) => {
    if (!userId) {
      throw AppError('User ID is required', 400);
    }

    const projects = await projectRepository.findByUserId(userId);
    
    // Calculate diagram count for each project dynamically
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        try {
          const classdiagrams = await classdiagramRepository.findByProjectId(project.id);
          const otherdiagrams = await otherdiagramRepository.findByProjectId(project.id);
          const classDiagramCount = (classdiagrams && classdiagrams.length > 0) ? 1 : 0;
          const otherDiagramCount = otherdiagrams?.length || 0;
          const count = classDiagramCount + otherDiagramCount;
          
          return {
            ...project,
            diagramCount: count,
          };
        } catch (error) {
          return {
            ...project,
            diagramCount: 0,
          };
        }
      })
    );
    
    return projectsWithCounts || [];
  },
});

module.exports = createGetProjectsUseCase;
