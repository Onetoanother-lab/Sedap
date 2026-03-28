import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'
import api from '../api/axios'

const AuthContext = createContext(null)

const LS_KEY = 'dashboard_user'

function persist(setUser, userData) {
    const obj = { ...userData }
    delete obj.password
    if (!obj.id && obj._id) obj.id = obj._id.toString()
    setUser(obj)
    localStorage.setItem(LS_KEY, JSON.stringify(obj))
    return obj
}

async function oauthUpsert(setUser, { uid, name, email, avatar }) {
    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
        throw new Error('Provider did not return a valid user ID. Please try again.')
    }
    try {
        const { data: uidMatches } = await api.get(`/users?uid=${encodeURIComponent(uid)}`)
        if (uidMatches.length > 0) return persist(setUser, uidMatches[0])

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

        const { data: created } = await api.post('/users', {
            name, email: email || null, avatar: avatar || null, uid, password: null,
        })
        return persist(setUser, created)
    } catch (error) {
        setUser(null)
        localStorage.removeItem(LS_KEY)
        throw error
    }
}

export function AuthProvider({ children }) {
    const [redirectError, setRedirectError] = useState('')
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(LS_KEY)
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    useEffect(() => {
        let isMounted = true
        getRedirectResult(auth)
            .then(async (result) => {
                if (!isMounted || !result) return
                const fu = result.user
                if (!fu?.uid) throw new Error('Authentication failed: invalid user data from provider')
                const providerData = fu.providerData?.[0] || {}
                await oauthUpsert(setUser, {
                    uid:    fu.uid,
                    name:   fu.displayName || providerData.displayName || 'User',
                    email:  fu.email       || providerData.email       || null,
                    avatar: fu.photoURL    || providerData.photoURL    || null,
                })
                if (isMounted) window.location.replace('/')
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

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/users/login', { email, password })
        return persist(setUser, data)
    }, [])

    const register = useCallback(async (name, email, password) => {
        const { data } = await api.post('/users', { name, email, password, avatar: null, uid: null })
        return persist(setUser, data)
    }, [])

    const googleLogin = useCallback(async (firebaseUser) => {
        return oauthUpsert(setUser, {
            uid:    firebaseUser.uid,
            name:   firebaseUser.displayName || 'Google User',
            email:  firebaseUser.email,
            avatar: firebaseUser.photoURL || null,
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
        setUser(null)
        localStorage.removeItem(LS_KEY)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, githubLogin, logout, redirectError }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
