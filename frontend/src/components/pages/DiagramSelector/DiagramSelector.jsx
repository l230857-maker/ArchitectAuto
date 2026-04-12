import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './DiagramSelector.css'
import classDiagramImage from '../../../assets/DiagramSelector-images/ClassDiagram.webp'
import activityDiagramImage from '../../../assets/DiagramSelector-images/Activity diagram.png'
import sequenceDiagramImage from '../../../assets/DiagramSelector-images/SequenceDiagram.png'
import stateDiagramImage from '../../../assets/DiagramSelector-images/StateDiagram.png'
import useCaseDiagramImage from '../../../assets/DiagramSelector-images/UseCaseDiagram.png'
import erDiagramImage from '../../../assets/DiagramSelector-images/ERDiagram.png'

const diagramOptions = [
  {
    id: 'class',
    title: 'Class Diagram',
    description: 'Describe classes, attributes, methods and relationships.',
    image: classDiagramImage,
  },
  {
    id: 'activity',
    title: 'Activity Diagram',
    description: 'Model workflows and business processes.',
    image: activityDiagramImage,
  },
  {
    id: 'sequence',
    title: 'Sequence Diagram',
    description: 'Show object interactions in time sequence.',
    image: sequenceDiagramImage,
  },
  {
    id: 'state',
    title: 'State Diagram',
    description: 'Model state transitions of objects.',
    image: stateDiagramImage,
  },
  {
    id: 'usecase',
    title: 'Use Case Diagram',
    description: 'Describe system functionality from user perspective.',
    image: useCaseDiagramImage,
  },
  {
    id: 'er',
    title: 'ER Diagram',
    description: 'Design database entities and relationships.',
    image: erDiagramImage,
  },
]

function DiagramSelector() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state
  const [selectedDiagram, setSelectedDiagram] = useState('')

  const handleSelectDiagram = (diagramId) => {
    setSelectedDiagram(diagramId)
  }

  return (
    <div className="diagram-selector-container">
      <header className="diagram-selector-header">
        <h1>ArchitectAuto UML to Code Generator</h1>
        <button
          className="profile-icon"
          type="button"
          onClick={() => navigate('/profile')}
          title="Profile"
        >
          👤
        </button>
      </header>

      <main className="diagram-selector-main">
        <div className="diagram-selector-card">
          <div className="diagram-selector-intro">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/stack-selector')}
            >
              ← Back to Stack Selector
            </button>
            <div>
              <p className="diagram-selector-subtitle">Select Diagram Type</p>
              <h2 className="diagram-selector-title">Choose Diagram Type</h2>
              <p className="diagram-selector-description">
                Select the type of UML diagram to create.
              </p>
            </div>
          </div>

          {project && (
            <div className="diagram-project-summary">
              <p>
                <strong>Project:</strong> {project.name}
              </p>
              <p>
                <strong>Stack:</strong> {project.stack?.toUpperCase()}
              </p>
            </div>
          )}

          <div className="diagram-grid">
            {diagramOptions.map((diagram) => (
              <button
                key={diagram.id}
                type="button"
                className={`diagram-card ${selectedDiagram === diagram.id ? 'selected' : ''}`}
                onClick={() => handleSelectDiagram(diagram.id)}
              >
                <div className="diagram-card-image-wrapper">
                  <img
                    src={diagram.image}
                    alt={diagram.title}
                    className="diagram-card-image"
                  />
                </div>
                <div className="diagram-card-body">
                  <h3>{diagram.title}</h3>
                  <p>{diagram.description}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedDiagram && (
            <div className="diagram-selected-message">
              <strong>Selected Diagram:</strong> {diagramOptions.find((item) => item.id === selectedDiagram)?.title}
            </div>
          )}
        </div>
      </main>

      <footer className="diagram-selector-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default DiagramSelector
