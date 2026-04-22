import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { clearAuthSession, getAuthSession } from '../../../lib/auth'

function Dashboard() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const [projects] = useState([
    {
      id: 1,
      name: 'E-commerce Platform',
      stack: 'MERN',
      diagramCount: 5,
    },
    {
      id: 2,
      name: 'Social Media App',
      stack: 'PERN',
      diagramCount: 5,
    },
    {
      id: 3,
      name: 'Blog System',
      stack: 'MEAN',
      diagramCount: 5,
    },
    {
      id: 4,
      name: 'Task Manager',
      stack: 'MERN',
      diagramCount: 5,
    },
    {
      id: 5,
      name: 'Student Management System',
      stack: 'MERN',
      diagramCount: 5,
    },
    {
      id: 6,
      name: 'Attendance Management System',
      stack: 'MERN',
      diagramCount: 5,
    },
  ])

  const handleCreateProject = () => {
    navigate('/stack-selector')
  }

  const handleProjectClick = (project) => {
    navigate('/project-details', { state: project })
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
        <button className="profile-icon" onClick={handleProfileClick} title="Edit Profile">
          Profile
        </button>
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
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleProjectClick(project)}
                >
                  <h4 className="project-name">{project.name}</h4>
                  <div className="project-info">
                    <p className="project-stack">
                      <span className="label">Stack:</span> {project.stack}
                    </p>
                    <p className="project-diagrams">
                      <span className="label">Diagram Count:</span> {project.diagramCount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="dashboard-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default Dashboard
