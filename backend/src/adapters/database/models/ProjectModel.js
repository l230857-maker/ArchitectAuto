const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stack_name: {
      type: String,
      required: true,
      enum: ['MERN', 'PERN', 'MEAN', 'MEVN', 'LAMP', 'JAMSTACK', 'Other'],
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Performance: index for finding user's projects
    },
    classDiagramId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassDiagram',
      default: null,
    },
    otherDiagramIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OtherDiagram',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
