import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './SignUp.css'

function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('test1@gmail.com')
  const [password, setPassword] = useState('••••••••••••')
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignUp = (e) => {
    e.preventDefault()
    console.log('Sign up clicked', { email, password, confirmPassword })
    // Navigate to dashboard after sign up
    navigate('/dashboard')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
  }

  return (
    <div className="signup-container">
      <header className="signup-header">
        <h1>ArchitectAuto UML to Code Generator</h1>
      </header>

      <main className="signup-main">
        <div className="signup-card">
          <p className="signup-welcome">Welcome !!!</p>
          <h2 className="signup-title">Sign Up</h2>

          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                className="form-input"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••••••"
              />
            </div>

            <button type="submit" className="signup-button">
              SIGN UP
              <span className="signup-arrow"> →</span>
            </button>
          </form>

          <p className="signup-signin-text">
            Already have an account?{' '}
            <Link to="/signin" className="signup-link">
              sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="signup-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default SignUp
