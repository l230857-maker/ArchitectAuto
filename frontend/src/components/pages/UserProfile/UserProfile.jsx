import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserProfile.css'
import { clearAuthSession, getAuthSession } from '../../../lib/auth'
import { API_BASE_URL } from '../../../lib/api'

function UserProfile() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const [email] = useState(session?.user?.email || 'No user signed in')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword] = useState(false)
  const [showConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMessage, setDeleteMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in all fields')
      setMessageType('error')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long')
      setMessageType('error')
      return
    }

    try {
      const session = getAuthSession()
      const token = session?.token

      if (!token) {
        setMessage('Authentication required. Please login again.')
        navigate('/signin')
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Failed to change password')
        setMessageType('error')
        return
      }

      setMessage('Password changed successfully!')
      setMessageType('success')
      setNewPassword('')
      setConfirmPassword('')

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage('An error occurred while changing password')
      setMessageType('error')
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true)
    setDeletePassword('')
    setDeleteMessage('')
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setDeletePassword('')
    setDeleteMessage('')
  }

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setDeleteMessage('Please enter your password to confirm deletion')
      return
    }

    try {
      setIsDeleting(true)
      const session = getAuthSession()
      const token = session?.token

      if (!token) {
        setDeleteMessage('Authentication required. Please login again.')
        navigate('/signin')
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setDeleteMessage(data.message || 'Failed to delete account')
        setIsDeleting(false)
        return
      }

      // Clear auth session and redirect to signin
      clearAuthSession()
      navigate('/signin')
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleteMessage('An error occurred while deleting your account')
      setIsDeleting(false)
    }
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>ArchitectAuto UML to Code Generator</h1>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <p className="profile-welcome">Manage Your Account</p>
          <h2 className="profile-title">User Profile</h2>

          <div className="profile-info-section">
            <div className="user-info">
              <label>Current Email</label>
              <div className="username-display">{email}</div>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Rewrite Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm the new password"
              />
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="button-group">
              <button type="submit" className="change-password-btn">
                Change Password
                <span className="btn-arrow"> -&gt;</span>
              </button>
              <button
                type="button"
                className="delete-account-btn"
                onClick={handleDeleteAccountClick}
              >
                Delete Account
              </button>
              <button
                type="button"
                className="back-btn"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  clearAuthSession()
                  navigate('/signin')
                }}
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h3>Delete Account</h3>
            <div className="modal-warning">
              <p className="warning-text">⚠️ Deleting your account is permanent</p>
              <p>All your projects and diagrams will be deleted permanently.</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmDelete() }}>
              <div className="form-group">
                <label htmlFor="delete-password">Enter your password to authorize deletion</label>
                <input
                  type="password"
                  id="delete-password"
                  className="form-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isDeleting}
                />
              </div>

              {deleteMessage && (
                <div className={`message ${deleteMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {deleteMessage}
                </div>
              )}

              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-delete-btn"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="profile-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default UserProfile
