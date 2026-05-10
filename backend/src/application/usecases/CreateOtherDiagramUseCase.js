const AppError = require('../../domain/errors/AppError');

const createCreateOtherDiagramUseCase = ({ otherdiagramRepository, projectRepository }) => ({
  async execute({ name, type, projectId }) {
    if (!name || !name.trim()) {
      throw AppError('Diagram name is required', 400);
    }

    if (!type) {
      throw AppError('Diagram type is required', 400);
    }

    if (!projectId) {
      throw AppError('Project ID is required', 400);
    }

    const validTypes = ['activity', 'sequence', 'usecase', 'erd', 'state'];
    if (!validTypes.includes(type)) {
      throw AppError(`Invalid diagram type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    // Verify project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw AppError('Project not found', 404);
    }

    // Create new other diagram with empty layout
    const diagram = await otherdiagramRepository.save({
      name: name.trim(),
      type,
      projectId,
      visualLayout: { nodes: [], edges: [] },
    });

    // Update project with the new diagram ID in otherDiagramIds array
    const updatedOtherDiagramIds = project.otherDiagramIds ? [...project.otherDiagramIds, diagram.id] : [diagram.id];
    await projectRepository.update(projectId, {
      name: project.name,
      stack_name: project.stack_name,
      classDiagramId: project.classDiagramId,
      otherDiagramIds: updatedOtherDiagramIds,
    });

    return {
      id: diagram.id,
      name: diagram.name,
      type: diagram.type,
      projectId: diagram.projectId,
      visualLayout: diagram.visualLayout,
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
    };
  },
});

module.exports = createCreateOtherDiagramUseCase;
