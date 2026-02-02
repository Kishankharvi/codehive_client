import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaGithub, FaMoon, FaSun, FaArrowRight, FaCode, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, loginWithGithub } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(username, email, password);
        if (result.success) {
            toast.success('Account created successfully!');
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
                    <div className="absolute bottom-[-20%] left-[-20%] w-[100%] h-[100%] rounded-full bg-indigo-600 blur-[120px]" />
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-orange-600 blur-[100px] animate-pulse" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-8 leading-tight tracking-tight">
                        Start your journey <br />
                        with <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">CodeHive.</span>
                    </h1>

                    <div className="space-y-6">
                        {[
                            'Real-time collaborative editing',
                            // 'Integrated terminal & compilation',
                            'GitHub repository sync',
                            'Team management & permissions'
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <FaCheck className="text-green-400 text-sm" />
                                </div>
                                <span className="text-lg text-gray-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Right Side: Auth Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Aurora Background */}
                <div className="lg:hidden absolute inset-0 -z-10">
                    <div className="aurora-blob blob-3"></div>
                    <div className="aurora-blob blob-1"></div>
                </div>

                <div className="w-full max-w-md">
                    <div className="flex justify-between items-center mb-8">
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

                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">Create an account</h2>
                        <p className="text-[var(--text-secondary)]">Join thousands of developers code in real-time.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[var(--text-main)]">Username</label>
                            <input
                                type="text"
                                className="input-new"
                                placeholder="e.g. jsmith dev"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[var(--text-main)]">Email</label>
                            <input
                                type="email"
                                className="input-new"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[var(--text-main)]">Confirm</label>
                                <input
                                    type="password"
                                    className="input-new"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-new btn-primary-new w-full group mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Get Started <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="relative my-6 text-center">
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

                    <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
