const ClassDiagramModel = require('../models/ClassDiagramModel');
const mongoose = require('mongoose');
const createClassDiagram = require('../../../domain/entities/ClassDiagram');

const mapDocumentToClassDiagram = (doc) => {
  if (!doc) return null;
  return createClassDiagram({
    id: doc._id.toString(),
    name: doc.name,
    projectId: doc.projectId.toString(),
    visualLayout: doc.visualLayout,
    structuredUML: doc.structuredUML,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

const createMongoClassDiagramRepository = () => ({
  findById: async (id) => {
    const doc = await ClassDiagramModel.findById(id);
    return mapDocumentToClassDiagram(doc);
  },

  findByProjectId: async (projectId) => {
    try {
      // Convert string ID to ObjectId for MongoDB query
      const objectId = new mongoose.Types.ObjectId(projectId);
      const docs = await ClassDiagramModel.find({ projectId: objectId });
      return docs.map(mapDocumentToClassDiagram);
    } catch (error) {
      throw error;
    }
  },

  save: async (diagram) => {
    const doc = new ClassDiagramModel({
      name: diagram.name,
      projectId: diagram.projectId,
      visualLayout: diagram.visualLayout,
      structuredUML: diagram.structuredUML,
    });
    const saved = await doc.save();
    return mapDocumentToClassDiagram(saved);
  },

  update: async (id, diagram) => {
    const updated = await ClassDiagramModel.findByIdAndUpdate(
      id,
      {
        name: diagram.name,
        visualLayout: diagram.visualLayout,
        structuredUML: diagram.structuredUML,
      },
      { new: true }
    );
    return mapDocumentToClassDiagram(updated);
  },

  delete: async (id) => {
    const result = await ClassDiagramModel.findByIdAndDelete(id);
    return mapDocumentToClassDiagram(result);
  },

  deleteByProjectId: async (projectId) => {
    await ClassDiagramModel.deleteMany({ projectId });
  },
});

module.exports = createMongoClassDiagramRepository;
