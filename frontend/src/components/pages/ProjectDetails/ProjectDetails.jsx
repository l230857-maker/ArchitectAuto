import { useLocation, useNavigate } from 'react-router-dom'
import './ProjectDetails.css'
import classDiagramImage from '../../../assets/DiagramSelector-images/ClassDiagram.webp'
import activityDiagramImage from '../../../assets/DiagramSelector-images/Activity diagram.png'
import sequenceDiagramImage from '../../../assets/DiagramSelector-images/SequenceDiagram.png'
import stateDiagramImage from '../../../assets/DiagramSelector-images/StateDiagram.png'
import useCaseDiagramImage from '../../../assets/DiagramSelector-images/UseCaseDiagram.png'
import erDiagramImage from '../../../assets/DiagramSelector-images/ERDiagram.png'

const diagramCards = [
  {
    id: 'class',
    title: 'Class Diagram',
    image: classDiagramImage,
  },
  {
    id: 'activity',
    title: 'Activity Diagram',
    image: activityDiagramImage,
  },
  {
    id: 'sequence',
    title: 'Sequence Diagram',
    image: sequenceDiagramImage,
  },
  {
    id: 'state',
    title: 'State Diagram',
    image: stateDiagramImage,
  },
  {
    id: 'usecase',
    title: 'Use Case Diagram',
    image: useCaseDiagramImage,
  },
  {
    id: 'er',
    title: 'ER Diagram',
    image: erDiagramImage,
  },
]

function ProjectDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const project = location.state

  return (
    <div className="project-details-container">
      <header className="project-details-header">
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

      <main className="project-details-main">
        <div className="project-details-card">
          <div className="project-details-intro">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>

            <div>
              <h2 className="project-details-title">Project Details</h2>
              <p className="project-details-description">
                Diagrams that you made
              </p>
            </div>
          </div>

          {project ? (
            <div className="project-summary-box">
              <p>
                <strong>Project:</strong> {project.name}
              </p>
              <p>
                <strong>Tech Stack:</strong> {project.stack?.toUpperCase()}
              </p>
              <p>
                <strong>Diagram Count:</strong> {project.diagramCount ?? 5}
              </p>
            </div>
          ) : (
            <div className="project-summary-box no-project">
              <p>No project data available. Return to dashboard to select a project.</p>
            </div>
          )}

          <div className="diagram-grid">
            {diagramCards.slice(0, 5).map((diagram) => (
              <div key={diagram.id} className="diagram-card">
                <div className="diagram-card-image-wrapper">
                  <img
                    src={diagram.image}
                    alt={diagram.title}
                    className="diagram-card-image"
                  />
                </div>
                <div className="diagram-card-body">
                  <h3>{diagram.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="project-details-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default ProjectDetails
