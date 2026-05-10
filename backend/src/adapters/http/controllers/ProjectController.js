const createProjectController = ({ getProjectsUseCase, getDiagramsUseCase, createProjectUseCase, createClassDiagramUseCase, createOtherDiagramUseCase, updateClassDiagramUseCase, updateOtherDiagramUseCase, deleteProjectUseCase, deleteClassDiagramUseCase, deleteOtherDiagramUseCase, generateCodeUseCase }) => ({
  getUserProjects: async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return next(require('../../domain/errors/AppError')('User ID is required', 401));
      }
      
      const projects = await getProjectsUseCase.execute(userId);
      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  },

  getProjectDiagrams: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const diagrams = await getDiagramsUseCase.execute(projectId);
      res.status(200).json({
        success: true,
        data: diagrams,
      });
    } catch (error) {
      next(error);
    }
  },

  createProject: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { name, stack_name } = req.body;
      const project = await createProjectUseCase.execute({ name, stack_name, userId });
      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  createClassDiagram: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { name } = req.body;
      const diagram = await createClassDiagramUseCase.execute({ name, projectId });
      res.status(201).json({
        success: true,
        data: diagram,
        message: 'Class diagram created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  createOtherDiagram: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { name, type } = req.body;
      const diagram = await createOtherDiagramUseCase.execute({ name, type, projectId });
      res.status(201).json({
        success: true,
        data: diagram,
        message: 'Diagram created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  updateClassDiagram: async (req, res, next) => {
    try {
      const { diagramId } = req.params;
      const { name, visualLayout, structuredUML } = req.body;
      const diagram = await updateClassDiagramUseCase.execute({ id: diagramId, name, visualLayout, structuredUML });
      res.status(200).json({
        success: true,
        data: diagram,
        message: 'Class diagram updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  updateOtherDiagram: async (req, res, next) => {
    try {
      const { diagramId } = req.params;
      const { name, visualLayout, structuredData } = req.body;
      const diagram = await updateOtherDiagramUseCase.execute({ id: diagramId, name, visualLayout, structuredData });
      res.status(200).json({
        success: true,
        data: diagram,
        message: 'Diagram updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProject: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { projectId } = req.params;
      const { password } = req.body;

      if (!password) {
        return next(require('../../domain/errors/AppError')('Password is required', 400));
      }

      const result = await deleteProjectUseCase.execute({ projectId, userId, password });
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteClassDiagram: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { diagramId } = req.params;
      const { password } = req.body;

      if (!password) {
        return next(require('../../domain/errors/AppError')('Password is required', 400));
      }

      const result = await deleteClassDiagramUseCase.execute({ diagramId, userId, password });
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteOtherDiagram: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { diagramId } = req.params;
      const { password } = req.body;

      if (!password) {
        return next(require('../../domain/errors/AppError')('Password is required', 400));
      }

      const result = await deleteOtherDiagramUseCase.execute({ diagramId, userId, password });
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  generateCode: async (req, res, next) => {
    try {
      const { classDiagramId } = req.params;

      if (!classDiagramId) {
        return next(require('../../domain/errors/AppError')('Class diagram ID is required', 400));
      }

      const result = await generateCodeUseCase.execute(classDiagramId);

      if (result.errors && result.errors.length > 0) {
        console.warn('Generation warnings:', result.errors);
      }

      // Create ZIP and stream to response
      await result.createZip(res);
    } catch (error) {
      next(error);
    }
  },
});

module.exports = createProjectController;
