// src/components/GitHubSignInButton.jsx
import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, githubProvider } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function GitHubSignInButton() {
  const { githubLogin } = useAuth()
  const navigate         = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleGitHubSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, githubProvider)
      await githubLogin(result.user)
      navigate('/menu')
    } catch (err) {
      const code = err.code || ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled. Please try again.')
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site.')
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection.')
      } else if (code === 'auth/account-exists-with-different-credential') {
        setError('This email is already linked to a different sign-in method.')
      } else {
        setError(err.message || 'GitHub sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="auth-error" style={{ marginBottom: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <button onClick={handleGitHubSignIn} disabled={loading} className="github-btn">
        {loading ? (
          <span className="auth-spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
        ) : (
          /* GitHub mark SVG */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        )}
        {loading ? 'Signing in…' : 'Continue with GitHub'}
      </button>
    </div>
  )
}