import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab]           = useState('login');    // 'login' | 'register'
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (tab === 'register') {
            if (!name || !email || !password || !confirm) { setError('Please fill all fields'); return; }
            if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
            if (password !== confirm) { setError('Passwords do not match'); return; }
        } else {
            if (!email || !password) { setError('Please fill all fields'); return; }
        }

        setLoading(true);
        try {
            if (tab === 'login') {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-base-content">
                        Sedap<span className="text-emerald-500">.</span>
                    </h1>
                    <p className="text-base-content/50 text-sm mt-1">Admin Dashboard</p>
                </div>

                <div className="bg-base-100 rounded-2xl shadow-lg overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-base-200">
                        {['login', 'register'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${
                                    tab === t
                                        ? 'text-emerald-600 border-b-2 border-emerald-500'
                                        : 'text-base-content/40 hover:text-base-content/70'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-4">

                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="input input-bordered w-full"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input input-bordered w-full"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                            />
                        </div>

                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    className="input input-bordered w-full"
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error text-sm py-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-success w-full text-white mt-2"
                        >
                            {loading && <span className="loading loading-spinner loading-sm" />}
                            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
