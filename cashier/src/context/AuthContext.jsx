import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

function persist(setUser, userData) {
    const obj = { ...userData }
    delete obj.password
    if (!obj.id && obj._id) obj.id = obj._id.toString()
    setUser(obj)
    localStorage.setItem('cashier_user', JSON.stringify(obj))
    return obj
}

async function oauthUpsert(setUser, { uid, name, email, avatar }) {
    setUser(null)
    localStorage.removeItem('cashier_user')

    if (!uid || typeof uid !== 'string' || uid.trim() === '')
        throw new Error('Provider did not return a valid user ID. Please try again.')

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
        email: email || null,
        avatar: avatar || null,
        uid,
        password: null,
    })
    return persist(setUser, created)
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('cashier_user')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/users/login', { email, password })
        return persist(setUser, data)
    }, [])

    const register = useCallback(async (name, email, password) => {
        const { data: existing } = await api.get(`/users?email=${encodeURIComponent(email)}`)
        if (existing.length > 0) throw new Error('Email already registered')
        const { data } = await api.post('/users', { name, email, password, avatar: null, uid: '' })
        return persist(setUser, data)
    }, [])

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
        <AuthContext.Provider value={{ user, login, register, googleLogin, githubLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
