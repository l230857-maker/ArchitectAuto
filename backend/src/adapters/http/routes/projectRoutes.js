const express = require('express');

const createProjectRoutes = (projectController, authMiddleware) => {
  const router = express.Router();

  router.post('/', authMiddleware, projectController.createProject);
  router.get('/my-projects', authMiddleware, projectController.getUserProjects);
  // More specific routes MUST come before less specific ones
  router.post('/generate/:classDiagramId', authMiddleware, projectController.generateCode);
  router.delete('/:projectId', authMiddleware, projectController.deleteProject);
  router.post('/:projectId/class-diagrams', authMiddleware, projectController.createClassDiagram);
  router.put('/:projectId/class-diagrams/:diagramId', authMiddleware, projectController.updateClassDiagram);
  router.delete('/:projectId/class-diagrams/:diagramId', authMiddleware, projectController.deleteClassDiagram);
  router.post('/:projectId/other-diagrams', authMiddleware, projectController.createOtherDiagram);
  router.put('/:projectId/other-diagrams/:diagramId', authMiddleware, projectController.updateOtherDiagram);
  router.delete('/:projectId/other-diagrams/:diagramId', authMiddleware, projectController.deleteOtherDiagram);
  router.get('/:projectId/diagrams', authMiddleware, projectController.getProjectDiagrams);

  return router;
};

module.exports = createProjectRoutes;
