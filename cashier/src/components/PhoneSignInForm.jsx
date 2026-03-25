// src/components/PhoneSignInForm.jsx
// Two-step flow:
//   Step 1 — enter phone number → Firebase sends SMS
//   Step 2 — enter OTP code    → Firebase verifies → calls onSuccess(firebaseUser)
import { useState, useEffect, useRef } from 'react'
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'
import { auth } from '../firebase'

export default function PhoneSignInForm({ onSuccess, onError }) {
  const [step, setStep]                     = useState('number') // 'number' | 'otp'
  const [phoneNumber, setPhoneNumber]       = useState('')
  const [otp, setOtp]                       = useState('')
  const [confirmationResult, setConfirmation] = useState(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const recaptchaRef                        = useRef(null)
  const verifierRef                         = useRef(null)

  // Clean up reCAPTCHA when component unmounts
  useEffect(() => {
    return () => {
      if (verifierRef.current) {
        verifierRef.current.clear()
        verifierRef.current = null
      }
    }
  }, [])

  // Step 1 — send SMS
  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')

    const cleaned = phoneNumber.trim()
    if (!cleaned) { setError('Please enter your phone number'); return }
    // Must start with + and country code, e.g. +998901234567
    if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
      setError('Use international format: +998901234567')
      return
    }

    setLoading(true)
    try {
      // Create invisible reCAPTCHA — required by Firebase for phone auth
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
          size: 'invisible',
          callback: () => {},        // called when reCAPTCHA resolves
          'expired-callback': () => { // reset if it expires
            verifierRef.current?.clear()
            verifierRef.current = null
          },
        })
      }

      const result = await signInWithPhoneNumber(auth, cleaned, verifierRef.current)
      setConfirmation(result)
      setStep('otp')
    } catch (err) {
      verifierRef.current?.clear()
      verifierRef.current = null
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Check the format and try again.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes.')
      } else {
        setError(err.message || 'Failed to send code. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) { setError('Please enter the verification code'); return }
    setLoading(true)
    try {
      const result = await confirmationResult.confirm(otp.trim())
      onSuccess(result.user)    // hand firebaseUser back to the page
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect code. Please check and try again.')
      } else if (err.code === 'auth/code-expired') {
        setError('Code expired. Go back and request a new one.')
      } else {
        setError(err.message || 'Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="phone-form">
      {/* Invisible reCAPTCHA mount point */}
      <div ref={recaptchaRef} />

      {error && (
        <div className="auth-error" style={{ marginBottom: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      {step === 'number' ? (
        <form onSubmit={handleSendCode} noValidate>
          <div className="auth-field" style={{ marginBottom: '12px' }}>
            <label className="auth-label" htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              className="auth-input"
              placeholder="+998 90 123 45 67"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              autoComplete="tel"
            />
            <p className="auth-hint">Include country code, e.g. +1, +44, +998</p>
          </div>
          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} noValidate>
          <p className="auth-hint" style={{ marginBottom: '12px' }}>
            Code sent to <strong style={{ color: 'var(--text-primary)' }}>{phoneNumber}</strong>
          </p>
          <div className="auth-field" style={{ marginBottom: '12px' }}>
            <label className="auth-label" htmlFor="otp">Verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              className="auth-input otp-input"
              placeholder="— — — — — —"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Verifying…' : 'Verify code'}
          </button>
          <button
            type="button"
            className="auth-back-btn"
            onClick={() => { setStep('number'); setOtp(''); setError('') }}
          >
            ← Change number
          </button>
        </form>
      )}
    </div>
  )
}