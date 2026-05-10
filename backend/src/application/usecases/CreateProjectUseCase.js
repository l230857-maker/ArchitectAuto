const AppError = require('../../domain/errors/AppError');
const createProject = require('../../domain/entities/Project');

const createCreateProjectUseCase = ({ projectRepository }) => ({
  async execute({ name, stack_name, userId }) {
    const trimmedName = name?.trim();

    if (!trimmedName || !stack_name || !userId) {
      throw AppError('Project name, stack_name, and userId are required', 400);
    }

    const validStacks = ['MERN', 'PERN', 'MEAN', 'MEVN', 'LAMP', 'JAMSTACK', 'Other'];
    if (!validStacks.includes(stack_name.toUpperCase())) {
      throw AppError(`Invalid stack. Must be one of: ${validStacks.join(', ')}`, 400);
    }

    const project = await projectRepository.save(createProject({
      name: trimmedName,
      stack_name: stack_name.toUpperCase(),
      userId,
    }));

    return {
      id: project.id,
      name: project.name,
      stack_name: project.stack_name,
      userId: project.userId,
      classDiagramId: project.classDiagramId,
      otherDiagramIds: project.otherDiagramIds,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  },
});

module.exports = createCreateProjectUseCase;
