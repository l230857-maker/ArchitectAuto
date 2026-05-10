import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StackSelector.css'

const mernImage = new URL('../../../assets/StackSelector-images/MernStack.png', import.meta.url).href
const pernImage = new URL('../../../assets/StackSelector-images/Pern.jpg', import.meta.url).href
const meanImage = new URL('../../../assets/StackSelector-images/MEAN_Stack.webp', import.meta.url).href
const mevnImage = new URL('../../../assets/StackSelector-images/MEVN_Stack.jpg', import.meta.url).href
const lampImage = new URL('../../../assets/StackSelector-images/LAMP_Stack.png', import.meta.url).href
const jamImage = new URL('../../../assets/StackSelector-images/JAM_Stack.png', import.meta.url).href

const stackOptions = [
  {
    id: 'mern',
    title: 'MERN Stack',
    description: 'MongoDB, Express.js, React, Node.js',
    image: mernImage,
  },
  {
    id: 'pern',
    title: 'PERN Stack',
    description: 'PostgreSQL, Express.js, React, Node.js',
    image: pernImage,
  },
  {
    id: 'mean',
    title: 'MEAN Stack',
    description: 'MongoDB, Express.js, Angular, Node.js',
    image: meanImage,
  },
  {
    id: 'mevn',
    title: 'MEVN Stack',
    description: 'MongoDB, Express.js, Vue.js, Node.js',
    image: mevnImage,
  },
  {
    id: 'lamp',
    title: 'LAMP Stack',
    description: 'Linux, Apache, MySQL, PHP',
    image: lampImage,
  },
  {
    id: 'jam',
    title: 'JAMstack',
    description: 'JavaScript, APIs, Markup',
    image: jamImage,
  },
]

function StackSelector() {
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [selectedStack, setSelectedStack] = useState('')
  const [savedProject, setSavedProject] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Map stack IDs to backend values
  const stackNameMap = {
    mern: 'MERN',
    pern: 'PERN',
    mean: 'MEAN',
    mevn: 'MEVN',
    lamp: 'LAMP',
    jam: 'JAMSTACK',
  }

  const handleSelectStack = async (stackId) => {
    if (!projectName.trim()) {
      setMessage('Please enter a project name before choosing a stack.')
      setSelectedStack('')
      setSavedProject(null)
      return
    }

    setIsLoading(true)
    try {
      const session = JSON.parse(localStorage.getItem('architectauto-auth') || '{}')
      const token = session.token

      if (!token) {
        setMessage('Authentication required. Please login again.')
        navigate('/signin')
        return
      }

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName.trim(),
          stack_name: stackNameMap[stackId],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        setMessage(error.message || 'Failed to create project')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const createdProject = {
        id: data.data.id,
        name: data.data.name,
        stack: stackId,
      }

      setSavedProject(createdProject)
      setSelectedStack(stackId)
      setMessage('Project created successfully!')

      setTimeout(() => {
        navigate('/diagram-selector', { state: createdProject })
      }, 1000)
    } catch (error) {
      console.error('Error creating project:', error)
      setMessage('An error occurred while creating the project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="stack-selector-container">
      <header className="stack-selector-header">
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

      <main className="stack-selector-main">
        <div className="stack-selector-card">
          <div className="stack-selector-intro">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
            <div>
              <h2 className="stack-selector-title">Choose Tech Stack</h2>
              <p className="stack-selector-description">
                Select the technology stack for your project.
              </p>
            </div>
          </div>

          <div className="stack-selector-form">
            <div className="form-group">
              <label htmlFor="project-name">Enter Project Name</label>
              <input
                id="project-name"
                type="text"
                className="form-input"
                disabled={isLoading}
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value)
                  setMessage('')
                }}
                placeholder="E-commerce Website"
              />
              {message && !savedProject && (
                <div className="message error">
                  {message}
                </div>
              )}
            </div>

            <div className="stack-grid">
              {stackOptions.map((stack) => (
                <button
                  key={stack.id}
                  type="button"
                  disabled={isLoading}
                  className={`stack-card ${selectedStack === stack.id ? 'selected' : ''} ${isLoading ? 'disabled' : ''}`}
                  onClick={() => handleSelectStack(stack.id)}
                >
                  <div className="stack-card-image-wrapper">
                    <img
                      src={stack.image}
                      alt={stack.title}
                      className="stack-card-image"
                    />
                  </div>
                  <div className="stack-card-body">
                    <h3>{stack.title}</h3>
                    <p>{stack.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {message && savedProject && (
              <div className={`message ${savedProject ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {savedProject && (
              <div className="saved-project-summary">
                <h3>Project Configured</h3>
                <p>
                  <strong>Name:</strong> {savedProject.name}
                </p>
                <p>
                  <strong>Stack:</strong>{' '}
                  {stackOptions.find((stack) => stack.id === savedProject.stack)?.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="stack-selector-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default StackSelector
