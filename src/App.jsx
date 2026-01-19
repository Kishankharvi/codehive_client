import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-custom-bg text-custom-primary">
                <div className="spinner w-10 h-10 border-t-primary" />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// GitHub OAuth Callback Handler
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { handleGithubCallback } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            handleGithubCallback(token);
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, [searchParams, handleGithubCallback, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-custom-bg text-custom-primary">
            <div className="spinner w-10 h-10 border-t-primary" />
            <p className="text-custom-secondary">Completing authentication...</p>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Toaster
                        position="top-center"
                        reverseOrder={false}
                        gutter={8}
                        toastOptions={{
                            duration: 5000,
                            style: {
                                background: '#334155',
                                color: '#fff',
                            },
                        }}
                    />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/:projectId"
                            element={
                                <ProtectedRoute>
                                    <ProjectView />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
