const AppError = require('../../domain/errors/AppError');

const createDeleteAccountUseCase = ({ 
  userRepository, 
  passwordService, 
  projectRepository,
  classDiagramRepository,
  otherDiagramRepository
}) => ({
  execute: async ({ userId, password }) => {
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

    // Get all projects for this user
    const projects = await projectRepository.findByUserId(userId);

    // Delete all diagrams associated with all projects
    if (projects && projects.length > 0) {
      for (const project of projects) {
        // Delete all class diagrams for this project
        await classDiagramRepository.deleteByProjectId(project.id);
        
        // Delete all other diagrams for this project
        await otherDiagramRepository.deleteByProjectId(project.id);

        // Delete project
        await projectRepository.delete(project.id);
      }
    }

    // Delete user
    await userRepository.deleteById(userId);

    return {
      success: true,
      message: 'Account and all associated data deleted successfully',
    };
  },
});

module.exports = createDeleteAccountUseCase;
