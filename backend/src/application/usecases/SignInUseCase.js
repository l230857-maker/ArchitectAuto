const AppError = require('../../domain/errors/AppError');

const createSignInUseCase = ({ userRepository, passwordService, tokenService }) => ({
  async execute({ email, password }) {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw AppError('Email and password are required', 400);
    }

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await passwordService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError('Invalid email or password', 401);
    }

    const token = tokenService.generate({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  },
});

module.exports = createSignInUseCase;