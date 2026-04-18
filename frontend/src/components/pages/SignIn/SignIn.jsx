import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './SignIn.css'
import { postJson } from '../../../lib/api'
import { saveAuthSession } from '../../../lib/auth'

function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('Please enter your email and password')
      return
    }

    try {
      setIsSubmitting(true)

      const data = await postJson('/auth/signin', {
        email,
        password,
      })

      saveAuthSession({
        user: data.user,
        token: data.token,
      })

      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
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
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <button type="submit" className="signin-button" disabled={isSubmitting}>
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
              <span className="signin-arrow"> -&gt;</span>
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
