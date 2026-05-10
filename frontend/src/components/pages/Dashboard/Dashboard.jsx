import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { clearAuthSession, getAuthSession } from '../../../lib/auth'
import { API_BASE_URL } from '../../../lib/api'

function Dashboard() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        // Get fresh session data inside the effect
        const currentSession = getAuthSession()
        const token = currentSession?.token
        
        if (!token) {
          setProjects([])
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          setProjects([])
          setLoading(false)
          return
        }

        const data = await response.json()
        setProjects(data.data || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    // Fetch projects on every mount to ensure updated diagram counts are shown
    // This ensures fresh data after returning from diagram creation
    fetchProjects()
  }, [])

  const handleCreateProject = () => {
    navigate('/stack-selector')
  }

  const handleProjectClick = (project) => {
    navigate('/project-details', { state: { project } })
  }

  const handleDeleteClick = (e, project) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setShowDeleteModal(true)
    setDeletePassword('')
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Password is required')
      return
    }

    try {
      setDeleteLoading(true)
      setDeleteError('')

      const session = JSON.parse(localStorage.getItem('architectauto-auth') || '{}')
      const token = session.token

      if (!token) {
        setDeleteError('Authentication required. Please login again.')
        navigate('/signin')
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/projects/${projectToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: deletePassword }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        setDeleteError(error.message || 'Failed to delete project')
        return
      }

      // Remove project from list
      setProjects(projects.filter((p) => p.id !== projectToDelete.id))
      setShowDeleteModal(false)
      setProjectToDelete(null)
      setDeletePassword('')
    } catch (error) {
      console.error('Error deleting project:', error)
      setDeleteError('An error occurred while deleting the project')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setProjectToDelete(null)
    setDeletePassword('')
    setDeleteError('')
  }

  const handleLogout = () => {
    clearAuthSession()
    navigate('/signin')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">ArchitectAuto UML to Code Generator</h1>
        <div className="header-actions">
          <button className="profile-icon" onClick={handleProfileClick} title="Edit Profile">
            👤
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2 className="dashboard-heading">Dashboard</h2>
          <p className="dashboard-subtitle">
            {session?.user?.email ? `Signed in as ${session.user.email}` : 'Manage your projects'}
          </p>

          <section className="manage-section">
            <button className="create-project-btn" onClick={handleCreateProject}>
              <span className="plus-icon">+</span>
              Create New Project
            </button>
          </section>

          <section className="projects-section">
            <h3 className="section-title">Your Projects</h3>
            {loading ? (
              <p className="loading-text">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="no-projects-text">No projects created</p>
            ) : (
              <div className="projects-grid">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="project-card"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="project-card-header">
                      <h4 className="project-name">{project.name}</h4>
                      <button
                        className="project-delete-btn"
                        onClick={(e) => handleDeleteClick(e, project)}
                        title="Delete project"
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="project-info">
                      <p className="project-stack">
                        <span className="label">Stack:</span> {project.stack_name}
                      </p>
                      <p className="project-diagrams">
                        <span className="label">Diagrams:</span> {project.diagramCount || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {showDeleteModal && projectToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Project</h3>
            <p className="delete-warning">
              Deleting project is permanent. All diagrams associated with project will be deleted.
            </p>
            <div className="delete-form">
              <label htmlFor="delete-password">Enter your password to confirm:</label>
              <input
                id="delete-password"
                type="password"
                className="delete-password-input"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmDelete()}
              />
              {deleteError && <p className="delete-error">{deleteError}</p>}
            </div>
            <div className="delete-dialog-buttons">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default Dashboard
