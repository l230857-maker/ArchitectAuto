import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserProfile.css'

function UserProfile() {
  const navigate = useNavigate()
  const [email] = useState('john.doe@gmail.com')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleChangePassword = (e) => {
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

    // Success
    setMessage('Password changed successfully!')
    setMessageType('success')
    setNewPassword('')
    setConfirmPassword('')

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
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
                placeholder="••••••••••••"
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
                placeholder="••••••••••••"
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
                <span className="btn-arrow"> →</span>
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
                onClick={() => navigate('/signin')}
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="profile-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default UserProfile
