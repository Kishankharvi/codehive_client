import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaGithub, FaMoon, FaSun, FaArrowRight, FaCode } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGithub } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex bg-[var(--bg-main)] overflow-hidden">
            {/* --- Left Side: Brand & Visuals --- */}
            <div className="hidden lg:flex w-1/2 relative bg-[var(--text-main)] overflow-hidden items-center justify-center text-white p-12">
                {/* Aurora Blobs for Left Side */}
                <div className="absolute top-0 left-0 w-full h-full opacity-60">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-orange-500 blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600 blur-[80px]" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm font-medium">CodeHive v2.0 Live</span>
                    </div>
                    <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
                        Build faster, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                            together.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed max-w-md">
                        The real-time collaboration platform for modern development teams. Experience zero-latency coding today.
                    </p>

                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                    {['A', 'K', 'J', 'R'][i - 1]}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-400 font-medium">+4,200 developers joined</span>
                    </div>
                </div>
            </div>

            {/* --- Right Side: Auth Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Aurora Background (only visible on small screens) */}
                <div className="lg:hidden absolute inset-0 -z-10">
                    <div className="aurora-blob blob-1"></div>
                    <div className="aurora-blob blob-2"></div>
                </div>

                <div className="w-full max-w-md">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-2 lg:hidden">
                            <FaCode className="text-2xl text-[var(--color-primary)]" />
                            <span className="text-xl font-bold text-[var(--text-main)]">CodeHive</span>
                        </div>
                        <div className="ml-auto">
                            <button onClick={toggleTheme} className="p-3 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                {theme === 'dark' ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">Welcome back</h2>
                        <p className="text-[var(--text-secondary)]">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[var(--text-main)]">Email</label>
                            <input
                                type="email"
                                className="input-new"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[var(--text-main)]">Password</label>
                            <input
                                type="password"
                                className="input-new"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                                <span className="text-sm text-[var(--text-secondary)]">Remember for 30 days</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn-new btn-primary-new w-full group"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign in <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]"></div></div>
                        <span className="relative bg-[var(--bg-main)] px-3 text-sm text-[var(--text-secondary)]">Or continue with</span>
                    </div>

                    <button
                        onClick={loginWithGithub}
                        className="btn-secondary-new btn-new w-full gap-3"
                    >
                        <FaGithub className="text-xl" />
                        Sign in with GitHub
                    </button>

                    <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-[var(--color-primary)] hover:underline">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
