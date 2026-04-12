import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './SignIn.css'

function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)

  const handleSignIn = (e) => {
    e.preventDefault()
    console.log('Sign in clicked', { email, password })
    // Navigate to dashboard after sign in
    navigate('/dashboard')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  return (
    <div className="signin-container">
      <header className="signin-header">
        <h1>ArchitectAuto UML to Code Generator</h1>
      </header>

      <main className="signin-main">
        <div className="signin-card">
          <p className="signin-welcome">Welcome back !!!</p>
          <h2 className="signin-title">Sign In</h2>

          <form onSubmit={handleSignIn}>
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

            <button type="submit" className="signin-button">
              SIGN IN
              <span className="signin-arrow"> →</span>
            </button>
          </form>

          <p className="signin-signup-text">
            don't have an account?{' '}
            <Link to="/signup" className="signin-link">
              Sign up
            </Link>
          </p>
        </div>
      </main>

      <footer className="signin-footer">
        © 2026 ArchitectAuto. All Rights Reserved.
      </footer>
    </div>
  )
}

export default SignIn
