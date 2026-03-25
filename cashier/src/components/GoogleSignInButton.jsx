// src/components/GoogleSignInButton.jsx
import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function GoogleSignInButton() {
  const { googleLogin } = useAuth()   // single source of truth — lives in AuthContext
  const navigate         = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      // 1. Open Google account picker
      const result = await signInWithPopup(auth, googleProvider)

      // 2. Hand the Firebase user to AuthContext — it handles everything:
      //    clears stale state, looks up / creates db record, writes localStorage
      await googleLogin(result.user)

      // 3. Navigate only after AuthContext has successfully set the new user
      navigate('/menu')

    } catch (err) {
      const code = err.code || ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled. Please try again.')
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site.')
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection.')
      } else {
        // Shows our own error messages thrown from AuthContext (e.g. "Is json-server running?")
        setError(err.message || 'Google sign-in failed. Please try again.')
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

      <button onClick={handleGoogleSignIn} disabled={loading} className="google-btn">
        {loading ? (
          <span className="auth-spinner" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#444' }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        )}
        {loading ? 'Signing in…' : 'Continue with Google'}
      </button>
    </div>
  )
}