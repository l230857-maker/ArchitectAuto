require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/infrastructure/config/database');
const AppError = require('./src/domain/errors/AppError');
const createMongoUserRepository = require('./src/adapters/database/repositories/MongoUserRepository');
const createMongoProjectRepository = require('./src/adapters/database/repositories/MongoProjectRepository');
const createMongoClassDiagramRepository = require('./src/adapters/database/repositories/MongoClassDiagramRepository');
const createMongoOtherDiagramRepository = require('./src/adapters/database/repositories/MongoOtherDiagramRepository');
const createBcryptPasswordService = require('./src/adapters/services/BcryptPasswordService');
const createJwtTokenService = require('./src/adapters/services/JwtTokenService');
const createSignUpUseCase = require('./src/application/usecases/SignUpUseCase');
const createSignInUseCase = require('./src/application/usecases/SignInUseCase');
const createChangePasswordUseCase = require('./src/application/usecases/ChangePasswordUseCase');
const createDeleteAccountUseCase = require('./src/application/usecases/DeleteAccountUseCase');
const createGetProjectsUseCase = require('./src/application/usecases/GetProjectsUseCase');
const createGetDiagramsUseCase = require('./src/application/usecases/GetDiagramsUseCase');
const createCreateProjectUseCase = require('./src/application/usecases/CreateProjectUseCase');
const createCreateClassDiagramUseCase = require('./src/application/usecases/CreateClassDiagramUseCase');
const createUpdateClassDiagramUseCase = require('./src/application/usecases/UpdateClassDiagramUseCase');
const createCreateOtherDiagramUseCase = require('./src/application/usecases/CreateOtherDiagramUseCase');
const createUpdateOtherDiagramUseCase = require('./src/application/usecases/UpdateOtherDiagramUseCase');
const createDeleteProjectUseCase = require('./src/application/usecases/DeleteProjectUseCase');
const createDeleteClassDiagramUseCase = require('./src/application/usecases/DeleteClassDiagramUseCase');
const createDeleteOtherDiagramUseCase = require('./src/application/usecases/DeleteOtherDiagramUseCase');
const createGenerateCodeUseCase = require('./src/application/usecases/GenerateCodeUseCase');
const CodeGeneratorInputValidator = require('./src/adapters/services/CodeGeneratorInputValidator');
const TypeMapper = require('./src/adapters/services/TypeMapper');
const ModelGenerator = require('./src/adapters/services/ModelGenerator');
const ControllerGenerator = require('./src/adapters/services/ControllerGenerator');
const RouteGenerator = require('./src/adapters/services/RouteGenerator');
const ComponentGenerator = require('./src/adapters/services/ComponentGenerator');
const ReadmeGenerator = require('./src/adapters/services/ReadmeGenerator');
const PackageJsonGenerator = require('./src/adapters/services/PackageJsonGenerator');
const EnvGenerator = require('./src/adapters/services/EnvGenerator');
const ServerGenerator = require('./src/adapters/services/ServerGenerator');
const ReactAppGenerator = require('./src/adapters/services/ReactAppGenerator');
const PagesGenerator = require('./src/adapters/services/PagesGenerator');
const StylesGenerator = require('./src/adapters/services/StylesGenerator');
const ViteConfigGenerator = require('./src/adapters/services/ViteConfigGenerator');
const CodeArchiveService = require('./src/adapters/services/CodeArchiveService');
const createAuthController = require('./src/adapters/http/controllers/AuthController');
const createProjectController = require('./src/adapters/http/controllers/ProjectController');
const createAuthRouter = require('./src/adapters/http/routes/authRoutes');
const createProjectRoutes = require('./src/adapters/http/routes/projectRoutes');
const createAuthMiddleware = require('./src/adapters/http/middlewares/auth');
const errorHandler = require('./src/adapters/http/middlewares/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

const userRepository = createMongoUserRepository();
const projectRepository = createMongoProjectRepository();
const classDiagramRepository = createMongoClassDiagramRepository();
const otherDiagramRepository = createMongoOtherDiagramRepository();
const passwordService = createBcryptPasswordService();
const tokenService = createJwtTokenService(
  process.env.JWT_SECRET || 'change-me-in-production',
  process.env.JWT_EXPIRES_IN || '7d'
);
const authMiddleware = createAuthMiddleware(tokenService);

const signUpUseCase = createSignUpUseCase({ userRepository, passwordService, tokenService });
const signInUseCase = createSignInUseCase({ userRepository, passwordService, tokenService });
const changePasswordUseCase = createChangePasswordUseCase({ userRepository, passwordService });
const deleteAccountUseCase = createDeleteAccountUseCase({ userRepository, passwordService, projectRepository, classDiagramRepository, otherDiagramRepository });
const getProjectsUseCase = createGetProjectsUseCase({ projectRepository, classdiagramRepository: classDiagramRepository, otherdiagramRepository: otherDiagramRepository });
const getDiagramsUseCase = createGetDiagramsUseCase({ classDiagramRepository, otherDiagramRepository });
const createProjectUseCase = createCreateProjectUseCase({ projectRepository });
const createClassDiagramUseCase = createCreateClassDiagramUseCase({ classdiagramRepository: classDiagramRepository, projectRepository });
const updateClassDiagramUseCase = createUpdateClassDiagramUseCase({ classdiagramRepository: classDiagramRepository });
const createOtherDiagramUseCase = createCreateOtherDiagramUseCase({ otherdiagramRepository: otherDiagramRepository, projectRepository });
const updateOtherDiagramUseCase = createUpdateOtherDiagramUseCase({ otherdiagramRepository: otherDiagramRepository });
const deleteProjectUseCase = createDeleteProjectUseCase({ projectRepository, passwordService, userRepository, classDiagramRepository, otherDiagramRepository });
const deleteClassDiagramUseCase = createDeleteClassDiagramUseCase({ classDiagramRepository, userRepository, passwordService });
const deleteOtherDiagramUseCase = createDeleteOtherDiagramUseCase({ otherdiagramRepository: otherDiagramRepository, userRepository, passwordService });

// Code generation services
const inputValidator = CodeGeneratorInputValidator;
const typeMapper = TypeMapper;
const modelGenerator = ModelGenerator;
const controllerGenerator = ControllerGenerator;
const routeGenerator = RouteGenerator;
const componentGenerator = ComponentGenerator;
const readmeGenerator = ReadmeGenerator;
const packageJsonGenerator = PackageJsonGenerator;
const envGenerator = EnvGenerator;
const serverGenerator = ServerGenerator;
const reactAppGenerator = ReactAppGenerator;
const pagesGenerator = PagesGenerator;
const stylesGenerator = StylesGenerator;
const viteConfigGenerator = ViteConfigGenerator;
const codeArchiveService = CodeArchiveService;

const generateCodeUseCase = createGenerateCodeUseCase({
  classDiagramRepository,
  projectRepository,
  inputValidator,
  modelGenerator,
  controllerGenerator,
  routeGenerator,
  componentGenerator,
  readmeGenerator,
  packageJsonGenerator,
  envGenerator,
  serverGenerator,
  reactAppGenerator,
  pagesGenerator,
  stylesGenerator,
  viteConfigGenerator,
  codeArchiveService,
});

const authController = createAuthController({ signUpUseCase, signInUseCase, changePasswordUseCase, deleteAccountUseCase });
const projectController = createProjectController({ getProjectsUseCase, getDiagramsUseCase, createProjectUseCase, createClassDiagramUseCase, createOtherDiagramUseCase, updateClassDiagramUseCase, updateOtherDiagramUseCase, deleteProjectUseCase, deleteClassDiagramUseCase, deleteOtherDiagramUseCase, generateCodeUseCase });

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ArchitectAuto backend is running',
  });
});

app.use('/api/auth', createAuthRouter(authController, authMiddleware));
app.use('/api/projects', createProjectRoutes(projectController, authMiddleware));

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
