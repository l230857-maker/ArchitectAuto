const AppError = require('../../domain/errors/AppError');

const createDeleteClassDiagramUseCase = ({ 
  classDiagramRepository,
  userRepository,
  passwordService
}) => ({
  execute: async ({ diagramId, userId, password }) => {
    if (!diagramId) {
      throw AppError('Diagram ID is required', 400);
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

    // Verify diagram exists
    const diagram = await classDiagramRepository.findById(diagramId);
    if (!diagram) {
      throw AppError('Diagram not found', 404);
    }

    // Delete diagram
    await classDiagramRepository.delete(diagramId);

    return {
      success: true,
      message: 'Class diagram deleted successfully',
    };
  },
});

module.exports = createDeleteClassDiagramUseCase;
