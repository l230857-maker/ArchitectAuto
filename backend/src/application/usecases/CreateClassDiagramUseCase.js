const AppError = require('../../domain/errors/AppError');

const createCreateClassDiagramUseCase = ({ classdiagramRepository, projectRepository }) => ({
  async execute({ name, projectId }) {
    if (!name || !name.trim()) {
      throw AppError('Diagram name is required', 400);
    }

    if (!projectId) {
      throw AppError('Project ID is required', 400);
    }

    // Verify project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw AppError('Project not found', 404);
    }

    // Create new class diagram with empty layout and UML structure
    const diagram = await classdiagramRepository.save({
      name: name.trim(),
      projectId,
      visualLayout: { nodes: [], edges: [] },
      structuredUML: { classes: [], relationships: [] },
    });

    // Update project with the class diagram ID
    await projectRepository.update(projectId, {
      name: project.name,
      stack_name: project.stack_name,
      classDiagramId: diagram.id,
      otherDiagramIds: project.otherDiagramIds,
    });

    return {
      id: diagram.id,
      name: diagram.name,
      projectId: diagram.projectId,
      visualLayout: diagram.visualLayout,
      structuredUML: diagram.structuredUML,
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
    };
  },
});

module.exports = createCreateClassDiagramUseCase;
