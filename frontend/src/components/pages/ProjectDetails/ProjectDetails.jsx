import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './ProjectDetails.css'
import { getAuthSession } from '../../../lib/auth'
import classDiagramImage from '../../../assets/DiagramSelector-images/ClassDiagram.webp'
import activityDiagramImage from '../../../assets/DiagramSelector-images/Activity diagram.png'
import sequenceDiagramImage from '../../../assets/DiagramSelector-images/SequenceDiagram.png'
import stateDiagramImage from '../../../assets/DiagramSelector-images/StateDiagram.png'
import useCaseDiagramImage from '../../../assets/DiagramSelector-images/UseCaseDiagram.png'
import erDiagramImage from '../../../assets/DiagramSelector-images/ERDiagram.png'

const diagramTypeMap = {
  class: { title: 'Class Diagram', image: classDiagramImage },
  activity: { title: 'Activity Diagram', image: activityDiagramImage },
  sequence: { title: 'Sequence Diagram', image: sequenceDiagramImage },
  state: { title: 'State Diagram', image: stateDiagramImage },
  usecase: { title: 'Use Case Diagram', image: useCaseDiagramImage },
  erd: { title: 'ER Diagram', image: erDiagramImage },
}

function ProjectDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getAuthSession()
  const project = location.state?.project
  const [enrichedProject, setEnrichedProject] = useState(project)
  const [diagrams, setDiagrams] = useState({ classDiagram: null, otherDiagrams: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false)
  const [deleteProjectPassword, setDeleteProjectPassword] = useState('')
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false)
  const [deleteProjectError, setDeleteProjectError] = useState('')
  const [showDeleteDiagramModal, setShowDeleteDiagramModal] = useState(false)
  const [diagramToDelete, setDiagramToDelete] = useState(null)
  const [deleteDiagramPassword, setDeleteDiagramPassword] = useState('')
  const [deleteDiagramLoading, setDeleteDiagramLoading] = useState(false)
  const [deleteDiagramError, setDeleteDiagramError] = useState('')

  // Fetch full project data if stack_name is missing
  useEffect(() => {
    if (project && !project.stack_name && project.id && session?.token) {
      const fetchProjectData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
            headers: { Authorization: `Bearer ${session.token}` },
          })
          
          if (response.ok) {
            const data = await response.json()
            setEnrichedProject(data.data)
          }
        } catch (error) {
          console.warn('Failed to fetch project details:', error)
        }
      }
      
      fetchProjectData()
    } else if (project?.stack_name) {
      setEnrichedProject(project)
    }
  }, [project, session?.token])

  useEffect(() => {
    if (!project?.id) {
      setError('No project selected')
      setLoading(false)
      return
    }

    const fetchDiagrams = async () => {
      try {
        setError(null)
        setLoading(true)
        const token = session?.token
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        const response = await fetch(`http://localhost:5000/api/projects/${project.id}/diagrams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch diagrams' }))
          throw new Error(errorData.message || 'Failed to fetch diagrams')
        }

        const data = await response.json()
        setDiagrams(data.data || { classDiagram: null, otherDiagrams: [] })
      } catch (err) {
        setError(err.message)
        console.error('Error fetching diagrams:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDiagrams()
  }, [project?.id, session?.token])

  const handleDiagramClick = (diagramType, diagramData) => {
    if (diagramType === 'class' && diagrams.classDiagram) {
      navigate('/class-diagram', { state: { diagram: diagrams.classDiagram, project: enrichedProject, from: 'project-details' } })
    } else if (diagramType !== 'class' && diagramData) {
      navigate('/other-diagram', { state: { diagram: diagramData, project: enrichedProject, from: 'project-details' } })
    }
  }

  const handleCreateDiagram = () => {
    navigate('/diagram-selector', { state: { project: enrichedProject, from: 'project-details' } })
  }

  const handleDeleteProjectClick = () => {
    setShowDeleteProjectModal(true)
    setDeleteProjectPassword('')
    setDeleteProjectError('')
  }

  const handleConfirmDeleteProject = async () => {
    if (!deleteProjectPassword.trim()) {
      setDeleteProjectError('Password is required')
      return
    }

    try {
      setDeleteProjectLoading(true)
      setDeleteProjectError('')

      const response = await fetch(
        `http://localhost:5000/api/projects/${project.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({ password: deleteProjectPassword }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        setDeleteProjectError(error.message || 'Failed to delete project')
        return
      }

      // Navigate to dashboard after deletion
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting project:', error)
      setDeleteProjectError('An error occurred while deleting the project')
    } finally {
      setDeleteProjectLoading(false)
    }
  }

  const handleCancelDeleteProject = () => {
    setShowDeleteProjectModal(false)
    setDeleteProjectPassword('')
    setDeleteProjectError('')
  }

  const handleDeleteDiagramClick = (e, diagram, diagramType) => {
    e.stopPropagation()
    setDiagramToDelete({ ...diagram, type: diagramType })
    setShowDeleteDiagramModal(true)
    setDeleteDiagramPassword('')
    setDeleteDiagramError('')
  }

  const handleConfirmDeleteDiagram = async () => {
    if (!deleteDiagramPassword.trim()) {
      setDeleteDiagramError('Password is required')
      return
    }

    try {
      setDeleteDiagramLoading(true)
      setDeleteDiagramError('')

      const endpoint = diagramToDelete.type === 'class'
        ? `http://localhost:5000/api/projects/${project.id}/class-diagrams/${diagramToDelete.id}`
        : `http://localhost:5000/api/projects/${project.id}/other-diagrams/${diagramToDelete.id}`

      const response = await fetch(
        endpoint,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({ password: deleteDiagramPassword }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        setDeleteDiagramError(error.message || 'Failed to delete diagram')
        return
      }

      // Refresh diagrams list
      if (diagramToDelete.type === 'class') {
        setDiagrams({ ...diagrams, classDiagram: null })
      } else {
        setDiagrams({
          ...diagrams,
          otherDiagrams: diagrams.otherDiagrams.filter((d) => d.id !== diagramToDelete.id),
        })
      }

      setShowDeleteDiagramModal(false)
      setDiagramToDelete(null)
      setDeleteDiagramPassword('')
    } catch (error) {
      console.error('Error deleting diagram:', error)
      setDeleteDiagramError('An error occurred while deleting the diagram')
    } finally {
      setDeleteDiagramLoading(false)
    }
  }

  const handleCancelDeleteDiagram = () => {
    setShowDeleteDiagramModal(false)
    setDiagramToDelete(null)
    setDeleteDiagramPassword('')
    setDeleteDiagramError('')
  }

  const getDiagramCards = () => {
    const cards = []

    if (diagrams.classDiagram) {
      cards.push({
        id: 'class',
        type: 'class',
        title: diagramTypeMap.class.title,
        image: diagramTypeMap.class.image,
        data: diagrams.classDiagram,
        hasData: true,
      })
    }

    diagrams.otherDiagrams.forEach((diagram) => {
      if (diagramTypeMap[diagram.type]) {
        cards.push({
          id: diagram.id,
          type: diagram.type,
          title: diagramTypeMap[diagram.type].title,
          image: diagramTypeMap[diagram.type].image,
          data: diagram,
          hasData: true,
        })
      }
    })

    return cards
  }

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
              <p className="project-details-description">Diagrams in this project</p>
            </div>
          </div>

          {project ? (
            <div className="project-summary-box">
              <p>
                <strong>Project:</strong> {project.name}
              </p>
              <p>
                <strong>Tech Stack:</strong> {project.stack_name?.toUpperCase()}
              </p>
              <p>
                <strong>Diagram Count:</strong> {getDiagramCards().length}
              </p>
            </div>
          ) : (
            <div className="project-summary-box no-project">
              <p>No project data available. Return to dashboard to select a project.</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="create-diagram-section">
            <button
              type="button"
              className="create-diagram-btn"
              onClick={handleCreateDiagram}
            >
              + Create Diagram
            </button>
            <button
              type="button"
              className="delete-project-btn"
              onClick={handleDeleteProjectClick}
            >
              🗑️ Delete Project
            </button>
          </div>

          <div className="diagram-grid">
            {loading ? (
              <p className="loading-text">Loading diagrams...</p>
            ) : getDiagramCards().length === 0 ? (
              <p className="no-diagrams-text">No diagrams yet. Create one to get started!</p>
            ) : (
              getDiagramCards().map((diagram) => (
                <div key={diagram.id} className="diagram-card-wrapper">
                  <button
                    type="button"
                    className={`diagram-card ${diagram.hasData ? 'clickable' : ''}`}
                    onClick={() => handleDiagramClick(diagram.type, diagram.data)}
                    disabled={!diagram.hasData}
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
                    </div>
                  </button>
                  <button
                    className="diagram-delete-btn"
                    onClick={(e) => handleDeleteDiagramClick(e, diagram.data, diagram.type)}
                    title="Delete diagram"
                    type="button"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showDeleteProjectModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Project</h3>
            <p className="delete-warning">
              Deleting project is permanent. All diagrams associated with project will be deleted.
            </p>
            <div className="delete-form">
              <label htmlFor="delete-project-password">Enter your password to confirm:</label>
              <input
                id="delete-project-password"
                type="password"
                className="delete-password-input"
                value={deleteProjectPassword}
                onChange={(e) => setDeleteProjectPassword(e.target.value)}
                placeholder="Your password"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmDeleteProject()}
              />
              {deleteProjectError && <p className="delete-error">{deleteProjectError}</p>}
            </div>
            <div className="delete-dialog-buttons">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={handleCancelDeleteProject}
                disabled={deleteProjectLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleConfirmDeleteProject}
                disabled={deleteProjectLoading}
              >
                {deleteProjectLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDiagramModal && diagramToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Diagram</h3>
            <p className="delete-warning">
              Deleting diagram is permanent. No way to recover.
            </p>
            <div className="delete-form">
              <label htmlFor="delete-diagram-password">Enter your password to confirm:</label>
              <input
                id="delete-diagram-password"
                type="password"
                className="delete-password-input"
                value={deleteDiagramPassword}
                onChange={(e) => setDeleteDiagramPassword(e.target.value)}
                placeholder="Your password"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmDeleteDiagram()}
              />
              {deleteDiagramError && <p className="delete-error">{deleteDiagramError}</p>}
            </div>
            <div className="delete-dialog-buttons">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={handleCancelDeleteDiagram}
                disabled={deleteDiagramLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleConfirmDeleteDiagram}
                disabled={deleteDiagramLoading}
              >
                {deleteDiagramLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="project-details-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default ProjectDetails
