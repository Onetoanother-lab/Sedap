import { createContext, useContext, useState, useCallback } from 'react'
import { signOut } from 'firebase/auth'
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
            name,
            ...(email  ? { email }  : {}),
            ...(avatar ? { avatar } : {}),
            uid,
        })
        return persist(setUser, created)
    } catch (error) {
        setUser(null)
        localStorage.removeItem(LS_KEY)
        throw error
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(LS_KEY)
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    // AUTH-D-04 fixed: removed getRedirectResult useEffect —
    // dashboard uses signInWithPopup only, so getRedirectResult always
    // returns null and is unnecessary.

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/users/login', { email, password })
        return persist(setUser, data)
    }, [])

    const register = useCallback(async (name, email, password) => {
        const { data } = await api.post('/users', { name, email, password })
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

    // AUTH-D-02 fixed: call signOut(auth) so Firebase session is cleared
    const logout = useCallback(() => {
        signOut(auth).catch(() => {})
        setUser(null)
        localStorage.removeItem(LS_KEY)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, githubLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
