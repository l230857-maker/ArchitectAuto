require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/infrastructure/config/database');
const AppError = require('./src/domain/errors/AppError');
const createMongoUserRepository = require('./src/adapters/database/repositories/MongoUserRepository');
const createBcryptPasswordService = require('./src/adapters/services/BcryptPasswordService');
const createJwtTokenService = require('./src/adapters/services/JwtTokenService');
const createSignUpUseCase = require('./src/application/usecases/SignUpUseCase');
const createSignInUseCase = require('./src/application/usecases/SignInUseCase');
const createAuthController = require('./src/adapters/http/controllers/AuthController');
const createAuthRouter = require('./src/adapters/http/routes/authRoutes');
const errorHandler = require('./src/adapters/http/middlewares/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

const userRepository = createMongoUserRepository();
const passwordService = createBcryptPasswordService();
const tokenService = createJwtTokenService(
  process.env.JWT_SECRET || 'change-me-in-production',
  process.env.JWT_EXPIRES_IN || '7d'
);

const signUpUseCase = createSignUpUseCase({ userRepository, passwordService, tokenService });
const signInUseCase = createSignInUseCase({ userRepository, passwordService, tokenService });
const authController = createAuthController({ signUpUseCase, signInUseCase });

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ArchitectAuto backend is running',
  });
});

app.use('/api/auth', createAuthRouter(authController));

app.use((req, res, next) => {
  next(AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const listenWithFallback = (appInstance, startingPort, maxAttempts = 10) => (
  new Promise((resolve, reject) => {
    const tryListen = (port, attemptsLeft) => {
      const server = http.createServer(appInstance);

      server.once('error', (error) => {
        if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
          console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
          tryListen(port + 1, attemptsLeft - 1);
          return;
        }

        reject(error);
      });

      server.once('listening', () => {
        resolve({ server, port });
      });

      server.listen(port);
    };

    tryListen(startingPort, maxAttempts);
  })
);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const { port } = await listenWithFallback(app, PORT);
    console.log(`Server running on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
