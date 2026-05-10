const AppError = require('../../domain/errors/AppError');

const createDeleteProjectUseCase = ({ 
  projectRepository,
  passwordService,
  userRepository,
  classDiagramRepository,
  otherDiagramRepository
}) => ({
  execute: async ({ projectId, userId, password }) => {
    if (!projectId) {
      throw AppError('Project ID is required', 400);
    }

    if (!userId) {
      throw AppError('User ID is required', 400);
    }

    if (!password || !password.trim()) {
      throw AppError('Password is required', 400);
    }

    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError('User not found', 404);
    }

    // Verify password
    const isPasswordValid = await passwordService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError('Invalid password', 401);
    }

    // Verify project exists and belongs to user
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw AppError('Project not found', 404);
    }

    if (project.userId !== userId) {
      throw AppError('Unauthorized: Project does not belong to this user', 403);
    }

    // Delete all class diagrams for this project
    await classDiagramRepository.deleteByProjectId(projectId);
    
    // Delete all other diagrams for this project
    await otherDiagramRepository.deleteByProjectId(projectId);

    // Delete project
    await projectRepository.delete(projectId);

    return {
      success: true,
      message: 'Project and all associated diagrams deleted successfully',
    };
  },
});

module.exports = createDeleteProjectUseCase;
