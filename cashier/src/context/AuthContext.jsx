import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getRedirectResult, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import api from '../api/axios'

const AuthContext = createContext(null)


// Strip password, normalise _id → id, persist to state + localStorage
function persist(setUser, userData) {
    const obj = { ...userData }
    delete obj.password
    if (!obj.id && obj._id) obj.id = obj._id.toString()
    setUser(obj)
    localStorage.setItem('cashier_user', JSON.stringify(obj))
    return obj
}

// Shared OAuth upsert logic used by both Google and GitHub
async function oauthUpsert(setUser, { uid, name, email, avatar }) {
    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
        throw new Error('Provider did not return a valid user ID. Please try again.')
    }

    try {
        // 1. Look up by Firebase uid
        const { data: uidMatches } = await api.get(`/users?uid=${encodeURIComponent(uid)}`)
        if (uidMatches.length > 0) return persist(setUser, uidMatches[0])

        // 2. Same email → link uid to existing account
        if (email) {
            const { data: emailMatches } = await api.get(`/users?email=${encodeURIComponent(email)}`)
            if (emailMatches.length > 0) {
                const { data: patched } = await api.patch(
                    `/users/${emailMatches[0].id || emailMatches[0]._id}`,
                    { uid, avatar: avatar || emailMatches[0].avatar }
                )
                return persist(setUser, patched)
            }
        }

        // 3. Brand-new user
        const { data: created } = await api.post('/users', {
            name,
            ...(email  ? { email }  : {}),
            ...(avatar ? { avatar } : {}),
            uid,
        })
        return persist(setUser, created)
    } catch (error) {
        setUser(null)
        localStorage.removeItem('cashier_user')
        throw error
    }
}

export function AuthProvider({ children }) {
    const [redirectError, setRedirectError] = useState('')
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('cashier_user')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    // Handle redirect result on app load (Google / GitHub signInWithRedirect)
    // This runs once when the app mounts after the OAuth redirect returns
    useEffect(() => {
        let isMounted = true
        getRedirectResult(auth)
            .then(async (result) => {
                if (!isMounted) return
                if (!result) return   // normal page load, no redirect pending
                const fu = result.user
                if (!fu?.uid) throw new Error('Authentication failed: invalid user data from provider')
                const providerData = fu.providerData?.[0] || {}
                await oauthUpsert(setUser, {
                    uid:    fu.uid,
                    name:   fu.displayName || providerData.displayName || 'User',
                    email:  fu.email       || providerData.email       || null,
                    avatar: fu.photoURL    || providerData.photoURL    || null,
                })
                if (isMounted) window.location.replace('/menu')
            })
            .catch((err) => {
                if (!isMounted) return
                const code = err.code || ''
                if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
                    setRedirectError(err.message || 'Sign-in failed. Please try again.')
                }
            })
        return () => { isMounted = false }
    }, [])

    // Email + password login
    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/users/login', { email, password })
        return persist(setUser, data)
    }, [])

    // Email + password register
    const register = useCallback(async (name, email, password) => {
        const { data } = await api.post('/users', { name, email, password })
        return persist(setUser, data)
    }, [])

    // These are kept for any component that still calls them directly
    // (they now just delegate to oauthUpsert)
    const googleLogin = useCallback(async (firebaseUser) => {
        return oauthUpsert(setUser, {
            uid:    firebaseUser.uid,
            name:   firebaseUser.displayName || 'Google User',
            email:  firebaseUser.email,
            avatar: firebaseUser.photoURL    || null,
        })
    }, [])

    const githubLogin = useCallback(async (firebaseUser) => {
        const providerData = firebaseUser.providerData?.[0] || {}
        return oauthUpsert(setUser, {
            uid:    firebaseUser.uid,
            name:   firebaseUser.displayName   || providerData.displayName || 'GitHub User',
            email:  firebaseUser.email         || providerData.email       || null,
            avatar: firebaseUser.photoURL      || providerData.photoURL    || null,
        })
    }, [])

    const logout = useCallback(() => {
        signOut(auth).catch(() => {})
        setUser(null)
        localStorage.removeItem('cashier_user')
    }, [])

    const updateUser = useCallback((updatedUser) => {
        const obj = { ...updatedUser }
        delete obj.password
        if (!obj.id && obj._id) obj.id = obj._id.toString()
        setUser(obj)
        localStorage.setItem('cashier_user', JSON.stringify(obj))
    }, [])

    return (
       <AuthContext.Provider value={{ user, login, register, googleLogin, githubLogin, logout, updateUser, redirectError }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}