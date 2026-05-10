const AppError = require('../../domain/errors/AppError');
const createUser = require('../../domain/entities/User');

const createSignUpUseCase = ({ userRepository, passwordService, tokenService }) => ({
  async execute({ email, password, confirmPassword }) {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      throw AppError('Email, password, and confirmPassword are required', 400);
    }

    if (password !== confirmPassword) {
      throw AppError('Passwords do not match', 400);
    }

    if (password.length < 6) {
      throw AppError('Password must be at least 6 characters long', 400);
    }

    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw AppError('User already exists with this email', 409);
    }

    const passwordHash = await passwordService.hash(password);

    const user = await userRepository.create(createUser({
      email: normalizedEmail,
      passwordHash,
    }));

    const token = tokenService.generate({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  },
});

module.exports = createSignUpUseCase;