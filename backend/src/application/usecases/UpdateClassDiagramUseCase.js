const AppError = require('../../domain/errors/AppError');

const createUpdateClassDiagramUseCase = ({ classdiagramRepository }) => ({
  execute: async ({ id, name, visualLayout, structuredUML }) => {
    if (!id) {
      throw AppError('Diagram ID is required', 400);
    }

    if (!name || !name.trim()) {
      throw AppError('Diagram name is required', 400);
    }

    // Update class diagram with new data
    const diagram = await classdiagramRepository.update(id, {
      name: name.trim(),
      visualLayout: visualLayout || { nodes: [], edges: [] },
      structuredUML: structuredUML || { classes: [], relationships: [] },
    });

    if (!diagram) {
      throw AppError('Failed to update class diagram', 500);
    }

    return {
      id: diagram.id,
      name: diagram.name,
      visualLayout: diagram.visualLayout,
      structuredUML: diagram.structuredUML,
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
    };
  },
});

module.exports = createUpdateClassDiagramUseCase;
