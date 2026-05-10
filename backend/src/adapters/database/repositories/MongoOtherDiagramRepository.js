const OtherDiagramModel = require('../models/OtherDiagramModel');
const mongoose = require('mongoose');
const createOtherDiagram = require('../../../domain/entities/OtherDiagram');

const mapDocumentToOtherDiagram = (doc) => {
  if (!doc) return null;
  return createOtherDiagram({
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    projectId: doc.projectId.toString(),
    visualLayout: doc.visualLayout,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

const createMongoOtherDiagramRepository = () => ({
  findById: async (id) => {
    const doc = await OtherDiagramModel.findById(id);
    return mapDocumentToOtherDiagram(doc);
  },

  findByProjectId: async (projectId) => {
    try {
      // Convert string ID to ObjectId for MongoDB query
      const objectId = new mongoose.Types.ObjectId(projectId);
      const docs = await OtherDiagramModel.find({ projectId: objectId });
      return docs.map(mapDocumentToOtherDiagram);
    } catch (error) {
      throw error;
    }
  },

  save: async (diagram) => {
    const doc = new OtherDiagramModel({
      name: diagram.name,
      type: diagram.type,
      projectId: diagram.projectId,
      visualLayout: diagram.visualLayout,
    });
    const saved = await doc.save();
    return mapDocumentToOtherDiagram(saved);
  },

  update: async (id, diagram) => {
    const updated = await OtherDiagramModel.findByIdAndUpdate(
      id,
      {
        name: diagram.name,
        type: diagram.type,
        visualLayout: diagram.visualLayout,
      },
      { new: true }
    );
    return mapDocumentToOtherDiagram(updated);
  },

  delete: async (id) => {
    const result = await OtherDiagramModel.findByIdAndDelete(id);
    return mapDocumentToOtherDiagram(result);
  },

  deleteByProjectId: async (projectId) => {
    await OtherDiagramModel.deleteMany({ projectId });
  },
});

module.exports = createMongoOtherDiagramRepository;
