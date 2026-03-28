import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { MdDashboard } from 'react-icons/md'

const EMAIL_RE = /\S+@\S+\.\S+/

export default function Login() {
  const { login, googleLogin, githubLogin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]             = useState({ email: '', password: '' })
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)

  const handleEmail = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    // AUTH-D-05: email format validation
    if (!EMAIL_RE.test(form.email)) { setError('Please enter a valid email address'); return }
    setLoading(true)
    try { await login(form.email, form.password); navigate('/') }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleOAuth = async (provider, key, fn) => {
    setError('')
    setOauthLoading(key)
    try {
      const result = await signInWithPopup(auth, provider)
      await fn(result.user)
      navigate('/')
    } catch (err) {
      const code = err.code || ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') setError('Sign-in cancelled.')
      else if (code === 'auth/popup-blocked') setError('Popup blocked — please allow popups for this site.')
      else setError(err.message || 'Sign-in failed.')
    } finally { setOauthLoading(null) }
  }

  return (
    <div className="min-h-screen bg-base-300 flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary flex-col justify-between p-14">
        <div className="flex items-center gap-3">
          <div className="bg-primary-content/20 rounded-2xl p-3">
            <MdDashboard className="text-primary-content" size={26} />
          </div>
          <span className="text-primary-content font-bold text-xl">Sedap Admin</span>
        </div>
        <div>
          <p className="text-primary-content/70 text-sm font-medium mb-2 uppercase tracking-widest">Welcome back</p>
          <h1 className="text-primary-content font-bold text-5xl leading-tight">Sign in<br/>to your<br/>dashboard.</h1>
        </div>
        <p className="text-primary-content/60 text-xs">Manage orders, products, customers and analytics in one place.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card bg-base-100 shadow-xl w-full max-w-sm">
          <div className="card-body gap-4">

            <div className="flex items-center gap-3 lg:hidden mb-2">
              <div className="bg-primary rounded-xl p-2.5">
                <MdDashboard className="text-primary-content" size={20} />
              </div>
              <span className="font-bold text-base-content">Sedap Admin</span>
            </div>

            <div className="mb-1">
              <h2 className="text-2xl font-bold text-primary">Welcome back</h2>
              <p className="text-sm text-base-content/50 mt-1">Sign in to continue</p>
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Google */}
            <button onClick={() => handleOAuth(googleProvider, 'google', googleLogin)}
              disabled={!!oauthLoading}
              className="btn bg-base-200 border-base-300 hover:bg-base-300 w-full gap-2 font-medium">
              {oauthLoading === 'google'
                ? <span className="loading loading-spinner loading-sm" />
                : <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
              }
              {oauthLoading === 'google' ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* GitHub */}
            <button onClick={() => handleOAuth(githubProvider, 'github', githubLogin)}
              disabled={!!oauthLoading}
              className="btn bg-base-200 border-base-300 hover:bg-base-300 w-full gap-2 font-medium">
              {oauthLoading === 'github'
                ? <span className="loading loading-spinner loading-sm" />
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
              }
              {oauthLoading === 'github' ? 'Signing in…' : 'Continue with GitHub'}
            </button>

            <div className="divider text-xs text-base-content/40 my-0">OR</div>

            <form onSubmit={handleEmail} className="flex flex-col gap-3" noValidate>
              <input type="email" placeholder="Email address" className="input input-bordered w-full"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
              <input type="password" placeholder="Password" className="input input-bordered w-full"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" />
              <button type="submit" disabled={loading}
                className="btn btn-primary w-full mt-1">
                {loading ? <span className="loading loading-spinner loading-sm" /> : null}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-base-content/60">
              No account yet?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
