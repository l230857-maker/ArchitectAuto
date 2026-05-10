const AppError = require('../../domain/errors/AppError');

const createGetDiagramsUseCase = ({ classDiagramRepository, otherDiagramRepository }) => ({
  execute: async (projectId) => {
    if (!projectId) {
      throw AppError('Project ID is required', 400);
    }

    const classData = await classDiagramRepository.findByProjectId(projectId);
    const otherDiagrams = await otherDiagramRepository.findByProjectId(projectId);

    return {
      classDiagram: (classData && classData.length > 0) ? classData[0] : null,
      otherDiagrams: otherDiagrams || [],
    };
  },
});

module.exports = createGetDiagramsUseCase;
