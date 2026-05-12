const AppError = require('../../domain/errors/AppError');

const createGenerateCodeUseCase = ({
  classDiagramRepository,
  projectRepository,
  inputValidator,
  modelGenerator,
  controllerGenerator,
  userModelGenerator,
  authControllerGenerator,
  authRoutesGenerator,
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
}) => ({
  /**
   * Generate MERN stack code from a class diagram
   * 
   * @param {string} classDiagramId - ID of the class diagram to generate code from
   * @returns {Promise<Object>} - Object containing files array and response stream function
   */
  execute: async (classDiagramId) => {
    if (!classDiagramId) {
      throw AppError('Class diagram ID is required', 400);
    }

    // Fetch the class diagram
    const diagram = await classDiagramRepository.findById(classDiagramId);
    if (!diagram) {
      throw AppError('Class diagram not found', 404);
    }

    // Fetch the project to get the project name
    const project = await projectRepository.findById(diagram.projectId);
    if (!project) {
      throw AppError('Project not found', 404);
    }

    // Extract structured UML
    if (!diagram.structuredUML) {
      throw AppError('Class diagram has no structured UML data', 400);
    }

    const { classes, relationships } = diagram.structuredUML;

    // Validate diagram
    const validation = inputValidator.validateDiagram(diagram.structuredUML);
    if (!validation.valid) {
      const errorMessage = validation.errors.join('; ');
      throw AppError(`Diagram validation failed: ${errorMessage}`, 400);
    }

    // Collect generated files
    const files = [];
    const errors = [];

    try {
      // Generate models
      const models = modelGenerator.generate(classes, relationships);
      files.push(...models);
    } catch (error) {
      console.error('Error generating models:', error.message);
      errors.push(`Model generation failed: ${error.message}`);
    }

    try {
      // Generate User model for authentication (always included)
      const userModel = userModelGenerator.generate();
      files.push(...userModel);
    } catch (error) {
      console.error('Error generating User model:', error.message);
      errors.push(`User model generation failed: ${error.message}`);
    }

    try {
      // Generate controllers
      const controllers = controllerGenerator.generate(classes, relationships);
      files.push(...controllers);
    } catch (error) {
      console.error('Error generating controllers:', error.message);
      errors.push(`Controller generation failed: ${error.message}`);
    }

    try {
      // Generate Auth Controller for authentication (always included)
      const authController = authControllerGenerator.generate();
      files.push(...authController);
    } catch (error) {
      console.error('Error generating Auth Controller:', error.message);
      errors.push(`Auth controller generation failed: ${error.message}`);
    }

    try {
      // Generate routes
      const routes = routeGenerator.generate(classes);
      files.push(...routes);
    } catch (error) {
      console.error('Error generating routes:', error.message);
      errors.push(`Route generation failed: ${error.message}`);
    }

    try {
      // Generate Auth Routes for authentication (always included)
      const authRoutes = authRoutesGenerator.generate();
      files.push(...authRoutes);
    } catch (error) {
      console.error('Error generating auth routes:', error.message);
      errors.push(`Auth routes generation failed: ${error.message}`);
    }

    try {
      // Generate components
      const components = componentGenerator.generate(classes);
      files.push(...components);
    } catch (error) {
      console.error('Error generating components:', error.message);
      errors.push(`Component generation failed: ${error.message}`);
    }

    try {
      // Generate README
      const readme = readmeGenerator.generate(diagram.name || 'Generated Project', classes, relationships);
      files.push(...readme);
    } catch (error) {
      console.error('Error generating README:', error.message);
      errors.push(`README generation failed: ${error.message}`);
    }

    try {
      // Generate package.json files
      const packageJsons = packageJsonGenerator.generate(project.name || 'generated-project');
      files.push(...packageJsons);
    } catch (error) {
      console.error('Error generating package.json:', error.message);
      errors.push(`Package.json generation failed: ${error.message}`);
    }

    try {
      // Generate .env.example files
      const envFiles = envGenerator.generate();
      files.push(...envFiles);
    } catch (error) {
      console.error('Error generating .env.example files:', error.message);
      errors.push(`.env.example generation failed: ${error.message}`);
    }

    try {
      // Generate server.js - FIXED: passing 'classes' instead of 'diagram.classes'
      const serverContent = serverGenerator.generate(classes);
      files.push({
        path: 'backend/src/server.js',
        content: serverContent,
      });
    } catch (error) {
      console.error('Error generating server.js:', error.message);
      errors.push(`server.js generation failed: ${error.message}`);
    }

    try {
      // Generate React app files
      const reactAppFiles = reactAppGenerator.generate(classes, project.name);
      files.push(...reactAppFiles);
    } catch (error) {
      console.error('Error generating React app files:', error.message);
      errors.push(`React app generation failed: ${error.message}`);
    }

    try {
      // Generate page components
      const pageFiles = pagesGenerator.generate(classes);
      files.push(...pageFiles);
    } catch (error) {
      console.error('Error generating page components:', error.message);
      errors.push(`Page generation failed: ${error.message}`);
    }

    try {
      // Generate CSS styles
      const styleFiles = stylesGenerator.generate();
      files.push(...styleFiles);
    } catch (error) {
      console.error('Error generating styles:', error.message);
      errors.push(`Style generation failed: ${error.message}`);
    }

    try {
      // Generate vite.config.js
      const viteConfigFiles = viteConfigGenerator.generate();
      files.push(...viteConfigFiles);
    } catch (error) {
      console.error('Error generating vite.config.js:', error.message);
      errors.push(`Vite config generation failed: ${error.message}`);
    }

    // Check if any files were generated
    if (files.length === 0) {
      throw AppError('Code generation failed: No files were generated', 500);
    }

    // Return files and archive service
    return {
      files,
      errors: errors.length > 0 ? errors : null,
      createZip: (response) => codeArchiveService.createZip(files, response),
    };
  },
});

module.exports = createGenerateCodeUseCase;