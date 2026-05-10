const AppError = require('../../domain/errors/AppError');

const createUpdateOtherDiagramUseCase = ({ otherdiagramRepository }) => ({
  execute: async ({ id, name, visualLayout, structuredData }) => {
    if (!id) {
      throw AppError('Diagram ID is required', 400);
    }

    if (!name || !name.trim()) {
      throw AppError('Diagram name is required', 400);
    }

    // Update other diagram with new data
    const diagram = await otherdiagramRepository.update(id, {
      name: name.trim(),
      visualLayout: visualLayout || { nodes: [], edges: [] },
    });

    if (!diagram) {
      throw AppError('Failed to update diagram', 500);
    }

    return {
      id: diagram.id,
      name: diagram.name,
      type: diagram.type,
      visualLayout: diagram.visualLayout,
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
    };
  },
});

module.exports = createUpdateOtherDiagramUseCase;
