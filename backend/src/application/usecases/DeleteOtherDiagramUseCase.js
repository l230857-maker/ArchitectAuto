const AppError = require('../../domain/errors/AppError');

const createDeleteOtherDiagramUseCase = ({ 
  otherdiagramRepository,
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
    const diagram = await otherdiagramRepository.findById(diagramId);
    if (!diagram) {
      throw AppError('Diagram not found', 404);
    }

    // Delete diagram
    await otherdiagramRepository.delete(diagramId);

    return {
      success: true,
      message: 'Diagram deleted successfully',
    };
  },
});

module.exports = createDeleteOtherDiagramUseCase;
