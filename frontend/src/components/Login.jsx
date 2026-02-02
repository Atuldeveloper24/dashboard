import React, { useState } from 'react';
import { Layers, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://dash-etica-production.up.railway.app';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            const response = await axios.post(`${API_BASE}/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const { access_token, role, username: userName } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', userName);

            onLoginSuccess(access_token, role);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-50">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-200 mb-4 transform hover:scale-105 transition-transform duration-300">
                        <Layers className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">WealthSync</h1>
                    <p className="text-slate-500 mt-2 font-medium">Internal Relationship Portal</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-indigo-600"></div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Sign In</h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-slate-800"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-slate-800"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm animate-shake">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <span>Sign Into Dashboard</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setUsername('admin');
                                setPassword('admin123');
                                // Give it a tiny delay so the state updates
                                setTimeout(() => {
                                    document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                }, 100);
                            }}
                            className="w-full bg-white border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 text-slate-600 font-bold py-4 rounded-2xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <Layers className="w-4 h-4 text-primary-500" />
                            <span>Try Demo Dashboard</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-400 text-xs font-medium border-t border-slate-50 pt-6">
                        <p>© 2026 WealthSync. Enterprise Security Enabled.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
