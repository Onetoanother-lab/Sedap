import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function persist(setUser, userData) {
    const obj = { ...userData };
    delete obj.password;
    if (!obj.id && obj._id) obj.id = obj._id.toString();
    setUser(obj);
    localStorage.setItem('dashboard_user', JSON.stringify(obj));
    return obj;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/users/login', { email, password });
        return persist(setUser, data);
    }, []);

    const register = useCallback(async (name, email, password) => {
        const { data: existing } = await api.get(`/users?email=${encodeURIComponent(email)}`);
        if (existing.length > 0) throw new Error('Email already registered');
        const { data } = await api.post('/users', { name, email, password, avatar: null, uid: '' });
        return persist(setUser, data);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('dashboard_user');
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
