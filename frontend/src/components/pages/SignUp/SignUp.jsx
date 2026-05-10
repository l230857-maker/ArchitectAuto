import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './SignUp.css'
import { postJson } from '../../../lib/api'
import { saveAuthSession } from '../../../lib/auth'

function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    try {
      setIsSubmitting(true)

      const data = await postJson('/auth/signup', {
        email,
        password,
        confirmPassword,
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
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <button type="submit" className="signup-button" disabled={isSubmitting}>
              {isSubmitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              <span className="signup-arrow"> -&gt;</span>
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
