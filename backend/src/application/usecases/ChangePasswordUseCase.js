const AppError = require('../../domain/errors/AppError');

const createChangePasswordUseCase = ({ userRepository, passwordService }) => ({
  execute: async ({ userId, newPassword }) => {
    if (!userId) {
      throw AppError('User ID is required', 400);
    }

    if (!newPassword || !newPassword.trim()) {
      throw AppError('New password is required', 400);
    }

    if (newPassword.length < 6) {
      throw AppError('Password must be at least 6 characters long', 400);
    }

    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError('User not found', 404);
    }

    // Hash the new password
    const hashedPassword = await passwordService.hash(newPassword);

    // Update user with new password
    const updatedUser = await userRepository.update(userId, {
      email: user.email,
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Password changed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    };
  },
});

module.exports = createChangePasswordUseCase;
