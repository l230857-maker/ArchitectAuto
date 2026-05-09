const ProjectModel = require('../models/ProjectModel');
const mongoose = require('mongoose');
const createProject = require('../../../domain/entities/Project');

const mapDocumentToProject = (doc) => {
  if (!doc) return null;
  return createProject({
    id: doc._id.toString(),
    name: doc.name,
    stack_name: doc.stack_name,
    userId: doc.userId.toString(),
    classDiagramId: doc.classDiagramId ? doc.classDiagramId.toString() : null,
    otherDiagramIds: doc.otherDiagramIds ? doc.otherDiagramIds.map((id) => id.toString()) : [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

const createMongoProjectRepository = () => ({
  findById: async (id) => {
    const doc = await ProjectModel.findById(id);
    return mapDocumentToProject(doc);
  },

  findByUserId: async (userId) => {
    const docs = await ProjectModel.find({ userId }).sort({ updatedAt: -1 });
    return docs.map(mapDocumentToProject);
  },

  save: async (project) => {
    const doc = new ProjectModel({
      name: project.name,
      stack_name: project.stack_name,
      userId: project.userId,
      classDiagramId: project.classDiagramId,
      otherDiagramIds: project.otherDiagramIds,
    });
    const saved = await doc.save();
    return mapDocumentToProject(saved);
  },

  update: async (id, project) => {
    const updateData = {
      name: project.name,
      stack_name: project.stack_name,
    };

    // Convert string IDs to ObjectIds for MongoDB
    if (project.classDiagramId) {
      updateData.classDiagramId = new mongoose.Types.ObjectId(project.classDiagramId);
    } else {
      updateData.classDiagramId = null;
    }

    if (project.otherDiagramIds && Array.isArray(project.otherDiagramIds)) {
      updateData.otherDiagramIds = project.otherDiagramIds.map(
        (diagramId) => new mongoose.Types.ObjectId(diagramId)
      );
    } else {
      updateData.otherDiagramIds = [];
    }

    const updated = await ProjectModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    return mapDocumentToProject(updated);
  },

  delete: async (id) => {
    const result = await ProjectModel.findByIdAndDelete(id);
    return mapDocumentToProject(result);
  },

  deleteByUserId: async (userId) => {
    await ProjectModel.deleteMany({ userId });
  },
});

module.exports = createMongoProjectRepository;
