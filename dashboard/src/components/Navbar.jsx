import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { FaUserCircle } from 'react-icons/fa';

// ── Theme Cycle ───────────────────────────────────────────────────
const THEMES = ['light', 'dark', 'system'];

function useThemeCycle() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const apply = (resolved) => document.documentElement.setAttribute('data-theme', resolved);
        if (theme !== 'system') { apply(theme); return; }
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        apply(mq.matches ? 'dark' : 'light');
        const handler = (e) => apply(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const cycleTheme = () => setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
    return { theme, cycleTheme };
}

const THEME_CONFIG = {
    light: {
        label: 'Light',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>,
        style: { background: '#ffffff', border: '2px solid #4db6ac', color: '#4db6ac', borderRadius: '14px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s' },
    },
    dark: {
        label: 'Dark',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20 }}><path strokeLinecap="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" /></svg>,
        style: { background: '#0f1923', border: '2px solid #4db6ac', color: '#4db6ac', borderRadius: '14px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s' },
    },
    system: {
        label: 'System',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20 }}><rect x="2" y="3" width="20" height="14" rx="2" /><path strokeLinecap="round" d="M8 21h8M12 17v4" /></svg>,
        style: { border: '2px solid #4db6ac', color: '#4db6ac', borderRadius: '14px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s' },
    },
};

function ThemeButton() {
    const { theme, cycleTheme } = useThemeCycle();
    const config = THEME_CONFIG[theme];
    return (
        <button onClick={cycleTheme} title={`Theme: ${config.label}`} style={config.style}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            {config.icon}
            <span>{config.label}</span>
        </button>
    );
}

// ── Navbar ────────────────────────────────────────────────────────
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex items-center justify-between max-h-[10%] p-4 w-full font-sans">

            {/* Search */}
            <div className="relative flex-grow max-w-2xl">
                <input type="search" placeholder="Search here"
                    className="w-full bg-base-100 py-3 px-6 rounded-xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] focus:outline-none" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4 ml-8">
                <div className="flex space-x-3">
                    <IconButton count="21" color="text-blue-500" bgColor="bg-blue-100" badgeColor="bg-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </IconButton>
                    <IconButton count="53" color="text-blue-400" bgColor="bg-blue-100" badgeColor="bg-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </IconButton>
                </div>

                <ThemeButton />

                <div className="h-10 w-[1.5px] bg-gray-200 mx-2" />

                {/* User info + logout */}
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-gray-400 text-[11px]">Logged in as</p>
                            <p className="text-base-content font-bold text-[13px] truncate max-w-32">{user.name}</p>
                        </div>

                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400" />
                        ) : (
                            <FaUserCircle className="w-10 h-10 text-emerald-500" />
                        )}

                        <button onClick={handleLogout}
                            className="btn btn-ghost btn-sm gap-1 text-base-content/60 hover:text-error"
                            title="Logout">
                            <LogOut size={16} />
                            <span className="hidden sm:inline text-xs">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const IconButton = ({ children, count, color, bgColor, badgeColor }) => (
    <div className={`relative p-3 ${bgColor} ${color} rounded-2xl cursor-pointer hover:scale-105 transition-transform`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
            {children}
        </svg>
        <span className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm`}>
            {count}
        </span>
    </div>
);

export default Navbar;
