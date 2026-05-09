const mongoose = require('mongoose');

const otherDiagramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['activity', 'sequence', 'usecase', 'erd', 'state'],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true, // Performance: index for finding diagrams in a project
    },
    visualLayout: {
      type: {
        nodes: [mongoose.Schema.Types.Mixed], // ReactFlow node objects
        edges: [mongoose.Schema.Types.Mixed], // ReactFlow edge objects
      },
      default: { nodes: [], edges: [] },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.OtherDiagram || mongoose.model('OtherDiagram', otherDiagramSchema);
