const mongoose = require('mongoose');

const classDiagramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    structuredUML: {
      type: {
        classes: [
          {
            id: {
              type: String,
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
            attributes: [
              {
                name: {
                  type: String,
                  required: true,
                },
                type: {
                  type: String,
                  required: true,
                },
              },
            ],
            methods: [
              {
                name: {
                  type: String,
                  required: true,
                },
                returnType: {
                  type: String,
                  required: true,
                },
                parameters: [
                  {
                    name: {
                      type: String,
                      required: true,
                    },
                    type: {
                      type: String,
                      required: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
        relationships: [
          {
            from: {
              type: String,
              required: true,
            },
            to: {
              type: String,
              required: true,
            },
            type: {
              type: String,
              enum: ['one-to-one', 'one-to-many', 'many-to-one'],
              required: true,
            },
          },
        ],
      },
      default: { classes: [], relationships: [] },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.ClassDiagram || mongoose.model('ClassDiagram', classDiagramSchema);
