import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../firebase'
import { useAuth } from '../context/AuthContext'
import '../auth.css'

function ForkKnifeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h1v11a1 1 0 0 0 2 0V11h1a2 2 0 0 0 2-2V2"/>
      <line x1="6" y1="2" x2="6" y2="7"/>
      <path d="M15 2a5 5 0 0 1 5 5v14a1 1 0 0 1-2 0V13h-2.5"/>
      <path d="M18 2v6"/>
    </svg>
  )
}

export default function Register() {
  const { register, googleLogin, githubLogin } = useAuth()
  const navigate = useNavigate()

  const [activeMethod, setActiveMethod] = useState(null)
  const [form, setForm]                 = useState({ name: '', email: '', password: '', confirm: '' })
  const [emailError, setEmailError]     = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [oauthState, setOauthState]     = useState({ loading: null, error: '' })

  const toggleMethod = (method) =>
    setActiveMethod((prev) => (prev === method ? null : method))

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')
    if (!form.name || !form.email || !form.password || !form.confirm) { setEmailError('Please fill in all fields'); return }
    if (form.password.length < 6) { setEmailError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setEmailError('Passwords do not match'); return }
    setEmailLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/menu')
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  const handleOAuth = async (provider, loginFn, key) => {
    setOauthState({ loading: key, error: '' })
    try {
      const result = await signInWithPopup(auth, provider)
      await loginFn(result.user)
      navigate('/menu')
    } catch (err) {
      const code = err.code || ''
      let msg = err.message || 'Sign-in failed.'
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
        msg = 'Sign-in cancelled.'
      else if (code === 'auth/popup-blocked')
        msg = 'Popup blocked — allow popups for this site.'
      else if (code === 'auth/network-request-failed')
        msg = 'Network error. Check your connection.'
      setOauthState({ loading: null, error: msg })
    }
  }

  const isLoading = (key) => oauthState.loading === key

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon"><ForkKnifeIcon /></div>
          <h1>Cashier<br /><span>Dashboard</span></h1>
          <p>Join your team and start managing orders, menus, and more from one place.</p>
          <div className="auth-left-rule" />
        </div>
        <div className="auth-left-deco">
          <div className="auth-left-deco-word">Get</div>
          <div className="auth-left-deco-word accent">Started.</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-mobile-brand">
            <div className="auth-mobile-brand-icon"><ForkKnifeIcon /></div>
            <span>Cashier Dashboard</span>
          </div>

          <h2 className="auth-heading">New account</h2>
          <p className="auth-sub">Choose how you'd like to sign up</p>

          {oauthState.error && (
            <div className="auth-error" style={{ marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {oauthState.error}
            </div>
          )}

          <div className="method-list">
            {/* ── Google ── */}
            <button className="method-btn" disabled={!!oauthState.loading}
              onClick={() => handleOAuth(googleProvider, googleLogin, 'google')}>
              {isLoading('google') ? (
                <span className="auth-spinner" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#555' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48" className="method-icon">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              <span>{isLoading('google') ? 'Signing in…' : 'Continue with Google'}</span>
            </button>

            {/* ── GitHub ── */}
            <button className="method-btn" disabled={!!oauthState.loading}
              onClick={() => handleOAuth(githubProvider, githubLogin, 'github')}>
              {isLoading('github') ? (
                <span className="auth-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="method-icon">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              <span>{isLoading('github') ? 'Signing in…' : 'Continue with GitHub'}</span>
            </button>

            {/* ── Email expandable ── */}
            <button
              className={`method-btn method-btn--last ${activeMethod === 'email' ? 'method-btn--active' : ''}`}
              onClick={() => toggleMethod('email')}
              disabled={!!oauthState.loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="method-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Continue with Email</span>
              <svg className={`method-chevron ${activeMethod === 'email' ? 'rotated' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div className={`method-panel method-panel--last ${activeMethod === 'email' ? 'method-panel--open' : ''}`}>
              {emailError && (
                <div className="auth-error" style={{ marginBottom: '12px' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {emailError}
                </div>
              )}
              <form onSubmit={handleEmailSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" type="text" className="auth-input" placeholder="John Doe"
                    value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} autoComplete="name" />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-email">Email Address</label>
                  <input id="reg-email" type="email" className="auth-input" placeholder="you@example.com"
                    value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-password">Password</label>
                  <input id="reg-password" type="password" className="auth-input" placeholder="At least 6 characters"
                    value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="new-password" />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" type="password" className="auth-input" placeholder="Repeat your password"
                    value={form.confirm} onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
                </div>
                <button type="submit" className="auth-btn" disabled={emailLoading} style={{ marginTop: '4px' }}>
                  {emailLoading ? <span className="auth-spinner" /> : null}
                  {emailLoading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>

          <div className="auth-divider" />
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
