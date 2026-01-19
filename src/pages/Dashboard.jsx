import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { FaPlus, FaGithub, FaCode, FaUsers, FaSignOutAlt, FaMoon, FaSun, FaSearch, FaFolder } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [collaboratingProjects, setCollaboratingProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCloneModal, setShowCloneModal] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setOwnedProjects(response.data.ownedProjects);
            setCollaboratingProjects(response.data.collaboratingProjects);
        } catch (error) {
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await api.post('/projects', {
                name: formData.get('name'),
                description: formData.get('description')
            });

            toast.success('Project created successfully!');
            setShowCreateModal(false);
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        }
    };

    const handleCloneProject = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await api.post('/projects/clone', {
                repoUrl: formData.get('repoUrl'),
                name: formData.get('name'),
                description: formData.get('description')
            });

            toast.success('Repository cloned successfully!');
            setShowCloneModal(false);
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clone repository');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-blob blob-1"></div>
                <div className="aurora-blob blob-2"></div>
                <div className="aurora-blob blob-3"></div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full glass-panel border-b-0 border-b-[var(--border-subtle)] bg-[var(--bg-glass-heavy)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                            <FaCode />
                        </div>
                        <span className="font-bold text-xl tracking-tight">CodeHive</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
                        >
                            {theme === 'dark' ? <FaSun /> : <FaMoon />}
                        </button>

                        <div className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>

                        <div className="flex items-center gap-3 pl-2">
                            <span className="text-sm font-medium hidden sm:inline">{user?.username}</span>
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                                className="w-8 h-8 rounded-full border border-[var(--border-subtle)]"
                                alt="Profile"
                            />
                            <button onClick={logout} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors ml-2">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                        <p className="text-[var(--text-secondary)]">Manage your projects and collaborations.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setShowCloneModal(true)} className="btn-new btn-secondary-new">
                            <FaGithub className="mr-2" /> Clone Repo
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className="btn-new btn-primary-new">
                            <FaPlus className="mr-2" /> New Project
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-8">
                    {/* Owned Projects */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                            <FaFolder className="text-[var(--color-primary)]" /> My Projects
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ownedProjects.length > 0 ? ownedProjects.map(project => (
                                <div
                                    key={project._id}
                                    onClick={() => navigate(`/project/${project._id}`)}
                                    className="glass-panel p-6 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all group bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] hover:border-[var(--color-primary)]/30"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-main)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                            <FaCode className="text-xl" />
                                        </div>
                                        {project.githubRepo && <FaGithub className="text-[var(--text-secondary)] text-lg" />}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors">{project.name}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-6 h-10">
                                        {project.description || "No description provided."}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-1">
                                            <FaUsers /> {project.collaborators.length} members
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] font-medium">
                                            {project.branches?.length || 0} branches
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-2xl">
                                    <p className="text-[var(--text-secondary)]">No projects yet. Create one to get started.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Collaborating Projects (if visible) */}
                    {collaboratingProjects.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                                <FaUsers className="text-indigo-500" /> Shared with me
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {collaboratingProjects.map(project => (
                                    <div
                                        key={project._id}
                                        onClick={() => navigate(`/project/${project._id}`)}
                                        className="glass-panel p-6 rounded-2xl cursor-pointer hover:-translate-y-1 transition-all group bg-[var(--bg-main)]/50 border border-[var(--border-subtle)]"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                                                    {project.owner.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)] font-medium">@{project.owner.username}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-500 transition-colors">{project.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="w-full max-w-lg glass-panel bg-[var(--bg-main)] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[var(--border-subtle)]">
                            <h2 className="text-xl font-bold">Create Project</h2>
                            <p className="text-sm text-[var(--text-secondary)]">Start a new codebase from scratch.</p>
                        </div>
                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Project Name</label>
                                <input name="name" className="input-new" placeholder="My Awesome Project" required autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea name="description" className="input-new min-h-[100px]" placeholder="What are you building?" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-new btn-ghost-new">Cancel</button>
                                <button type="submit" className="btn-new btn-primary-new px-6">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Clone Project Modal */}
            {showCloneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCloneModal(false)}>
                    <div className="w-full max-w-lg glass-panel bg-[var(--bg-main)] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[var(--border-subtle)]">
                            <h2 className="text-xl font-bold">Clone Repository</h2>
                            <p className="text-sm text-[var(--text-secondary)]">Import from GitHub.</p>
                        </div>
                        <form onSubmit={handleCloneProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Repo URL</label>
                                <input name="repoUrl" className="input-new font-mono text-sm" placeholder="https://github.com/user/repo" required autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Project Name (Optional)</label>
                                <input name="name" className="input-new" placeholder="Leave empty to use repo name" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCloneModal(false)} className="btn-new btn-ghost-new">Cancel</button>
                                <button type="submit" className="btn-new btn-primary-new px-6">Clone</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
