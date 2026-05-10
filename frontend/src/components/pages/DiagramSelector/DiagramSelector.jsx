import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './DiagramSelector.css'
import { getAuthSession } from '../../../lib/auth'
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
  const session = getAuthSession()
  const project = location.state?.project ?? location.state
  const [selectedDiagram, setSelectedDiagram] = useState('')
  const [hasClassDiagram, setHasClassDiagram] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [diagramName, setDiagramName] = useState('')
  const [selectedDiagramType, setSelectedDiagramType] = useState(null)

  useEffect(() => {
    if (project?.id && location.state?.from === 'project-details') {
      const checkClassDiagram = async () => {
        try {
          setLoading(true)
          const token = session?.token
          if (!token) {
            setLoading(false)
            return
          }

          const response = await fetch(`http://localhost:5000/api/projects/${project.id}/diagrams`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setHasClassDiagram(!!data.data?.classDiagram)
          }
        } catch (err) {
          console.error('Error checking class diagram:', err)
        } finally {
          setLoading(false)
        }
      }

      checkClassDiagram()
    }
  }, [project?.id, session?.token, location.state?.from])

  const handleSelectDiagram = (diagramId) => {
    setSelectedDiagramType(diagramId)
    setShowNameDialog(true)
  }

  const handleConfirmDiagramName = async () => {
    if (!diagramName.trim()) {
      alert('Please enter a diagram name')
      return
    }

    try {
      const session = JSON.parse(localStorage.getItem('architectauto-auth') || '{}')
      const token = session.token

      if (!token) {
        alert('Authentication required. Please login again.')
        navigate('/signin')
        return
      }

      let endpoint
      let body

      if (selectedDiagramType === 'class') {
        endpoint = `http://localhost:5000/api/projects/${project.id}/class-diagrams`
        body = { name: diagramName.trim() }
      } else {
        endpoint = `http://localhost:5000/api/projects/${project.id}/other-diagrams`
        body = { name: diagramName.trim(), type: selectedDiagramType }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.message || 'Failed to create diagram')
        return
      }

      const data = await response.json()
      setShowNameDialog(false)
      setDiagramName('')

      // Navigate to the diagram editor with the created diagram
      if (selectedDiagramType === 'class') {
        navigate('/class-diagram', { state: { project, diagram: data.data, from: 'diagram-selector' } })
      } else {
        navigate('/other-diagram', { state: { project, diagram: data.data, diagramType: selectedDiagramType, from: 'diagram-selector' } })
      }
    } catch (error) {
      console.error('Error creating diagram:', error)
      alert('An error occurred while creating the diagram')
    }
  }

  const handleCancelDialog = () => {
    setShowNameDialog(false)
    setDiagramName('')
    setSelectedDiagramType(null)
  }

  const visibleDiagrams = diagramOptions.filter((diagram) => {
    if (diagram.id === 'class' && hasClassDiagram) {
      return false
    }
    return true
  })

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
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
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
                <strong>Stack:</strong> {project.stack_name || project.stack?.toUpperCase()}
              </p>
            </div>
          )}

          <div className="diagram-grid">
            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : visibleDiagrams.length === 0 ? (
              <p className="no-diagrams-text">All diagram types have been created for this project.</p>
            ) : (
              visibleDiagrams.map((diagram) => (
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
              ))
            )}
          </div>

          {selectedDiagram && (
            <div className="diagram-selected-message">
              <strong>Selected Diagram:</strong> {diagramOptions.find((item) => item.id === selectedDiagram)?.title}
            </div>
          )}
        </div>
      </main>

      {showNameDialog && (
        <div className="diagram-name-dialog-overlay">
          <div className="diagram-name-dialog">
            <h3>Enter Diagram Name</h3>
            <input
              type="text"
              className="diagram-name-input"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              placeholder="e.g., User Management System"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleConfirmDiagramName()}
            />
            <div className="dialog-buttons">
              <button
                type="button"
                className="dialog-btn cancel-btn"
                onClick={handleCancelDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dialog-btn confirm-btn"
                onClick={handleConfirmDiagramName}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="diagram-selector-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default DiagramSelector
