import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import socketService from '../services/socketService';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import ChangesPanel from '../components/ChangesPanel';
import PushToGitHubButton from '../components/PushToGitHubButton';
import emailjs from '@emailjs/browser';
import { FaArrowLeft, FaUsers, FaCodeBranch, FaPlus, FaMoon, FaSun, FaCog, FaCode, FaClipboardList } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProjectView = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [currentBranch, setCurrentBranch] = useState('main');
    const [fileTree, setFileTree] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [showChangesPanel, setShowChangesPanel] = useState(false);
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProject();
        connectSocket();

        return () => {
            socketService.disconnect();
        };
    }, [projectId]);

    useEffect(() => {
        if (currentBranch) {
            fetchFileTree();
        }
    }, [currentBranch]);

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${projectId}`);
            setProject(response.data.project);
            setCurrentBranch(response.data.project.mainBranch || 'main');
        } catch (error) {
            toast.error('Failed to load project');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchFileTree = async () => {
        try {
            const response = await api.get(`/projects/${projectId}/files/${currentBranch}`);
            setFileTree(response.data.fileTree);
        } catch (error) {
            console.error('Failed to load file tree:', error);
        }
    };

    const connectSocket = () => {
        socketService.connect();

        socketService.on('user-joined', ({ user: joinedUser, activeUsers: users }) => {
            setActiveUsers(users);
            toast.success(`${joinedUser.username} joined`);
        });

        socketService.on('user-left', ({ username, activeUsers: users }) => {
            setActiveUsers(users);
            toast(`${username} left`, { icon: '👋' });
        });

        socketService.on('new-change', ({ change }) => {
            toast.info(`New change submitted by ${change.author.username}`);
        });

        setTimeout(() => {
            socketService.joinProject(projectId, user.id, currentBranch);
        }, 500);
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await api.post(`/projects/${projectId}/branches`, {
                branchName: formData.get('branchName'),
                baseBranch: currentBranch
            });

            toast.success('Branch created successfully!');
            setShowBranchModal(false);
            fetchProject();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create branch');
        }
    };

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');

        try {
            console.log('[Frontend] Sending invite request for:', username);
            await api.post(`/projects/${projectId}/collaborators`, {
                username: username,
                role: formData.get('role')
            });

            toast.success('Collaborator added successfully! Sending email...');

            // Close modal immediately
            setShowCollabModal(false);


            // Send email via EmailJS
            // SETUP REQUIRED: Replace the placeholders below with your EmailJS credentials
            // Follow the guide in: emailjs_setup_guide.md
            try {
                await emailjs.send(
                    'service_z6m71fg',        // ← Replace with your EmailJS Service ID
                    'template_7xgz2gk',       // ← Replace with your EmailJS Template ID
                    {
                        to_name: username,
                        from_name: user.username,
                        project_name: project.name,
                        role: formData.get('role'),
                        project_url: `${window.location.origin}/project/${projectId}`
                    },
                    'K-y3iYGoy2CyGTCg1'         // ← Replace with your EmailJS Public Key
                );

                toast.success(`Invitation email sent to ${username}!`);
            } catch (emailError) {
                console.error('[EmailJS Error]', emailError);
                toast.error('Collaborator added, but failed to send email invite.');
            }


            fetchProject();
        } catch (error) {
            console.error('[Frontend Error] Add collaborator failed:', error);
            toast.error(error.response?.data?.message || 'Failed to add collaborator');
        }
    };

    const isOwner = project?.owner._id === user.id;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300 overflow-hidden text-[var(--text-main)]">
            {/* Header - Compact & Functional */}
            <header className="flex justify-between items-center px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shadow-sm z-20 h-14 shrink-0">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] rounded-lg transition-all flex items-center gap-2 group"
                        title="Back to Dashboard"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="h-5 w-px bg-[var(--border-subtle)]"></div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold m-0 text-[var(--text-main)] truncate">{project?.name}</h1>
                        <p className="text-[10px] m-0 text-[var(--text-secondary)] truncate opacity-80">{project?.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Branch Selector */}
                    <div className="flex items-center gap-2 bg-[var(--bg-main)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--color-primary)] transition-colors">
                        <FaCodeBranch className="text-[var(--text-secondary)] text-xs" />
                        <select
                            value={currentBranch}
                            onChange={(e) => setCurrentBranch(e.target.value)}
                            className="bg-transparent text-xs font-medium text-[var(--text-main)] focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[150px]"
                        >
                            {project?.branches?.map(branch => (
                                <option key={branch.name} value={branch.name} className="bg-[var(--bg-secondary)] text-[var(--text-main)]">
                                    {branch.name}
                                    {branch.status === 'merged' && ' (merged)'}
                                </option>
                            ))}
                        </select>
                        {isOwner && (
                            <button
                                onClick={() => setShowBranchModal(true)}
                                className="ml-1 p-0.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded transition-colors"
                                title="New Branch"
                            >
                                <FaPlus size={10} />
                            </button>
                        )}
                    </div>

                    {/* Online Users */}
                    <div className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)] text-xs bg-[var(--bg-main)] px-2 py-1.5 rounded-lg border border-[var(--border-subtle)]" title="Online Collaborators">
                        <FaUsers size={12} />
                        <span>{activeUsers.length}</span>
                    </div>

                    {/* Collaborator Button */}
                    {isOwner && (
                        <button
                            onClick={() => setShowCollabModal(true)}
                            className="btn-primary-new py-1.5 px-3 rounded-lg text-xs"
                        >
                            <FaUsers size={12} className="mr-2" /> <span className="hidden lg:inline">Invite</span>
                        </button>
                    )}

                    {/* Push to GitHub Button */}
                    {isOwner && <PushToGitHubButton projectId={projectId} project={project} branch={currentBranch} />}

                    <div className="h-5 w-px bg-[var(--border-subtle)] mx-1"></div>

                    {/* Changes Button */}
                    <button
                        onClick={() => setShowChangesPanel(!showChangesPanel)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors relative"
                        aria-label="View Changes"
                        title="Pending Changes"
                    >
                        <FaClipboardList className="text-xs" />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <FaSun className="text-yellow-400 text-xs" /> : <FaMoon className="text-slate-600 text-xs" />}
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* File Explorer Sidebar */}
                <div className="w-[260px] flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col">
                    <div className="p-3 border-b border-[var(--border-subtle)] flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Explorer</span>
                        <FaCog className="text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer transition-colors" size={12} />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <FileExplorer
                            fileTree={fileTree}
                            onFileSelect={setSelectedFile}
                            selectedFile={selectedFile}
                            onRefresh={fetchFileTree}
                            projectId={projectId}
                            branch={currentBranch}
                        />
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-hidden bg-[var(--bg-main)] relative flex flex-col">
                    {/* Changes Panel Sidebar */}
                    {showChangesPanel && (
                        <div className="absolute top-0 right-0 w-96 h-full bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-10 shadow-lg">
                            <ChangesPanel
                                projectId={projectId}
                                branch={currentBranch}
                                isOwner={isOwner}
                            />
                        </div>
                    )}
                    {selectedFile ? (
                        <>
                            {/* File Tab - Basic implementation */}
                            <div className="h-9 bg-[var(--bg-main)] border-b border-[var(--border-subtle)] flex items-center px-4 gap-2">
                                <div className="text-xs text-[var(--text-secondary)] font-mono">{selectedFile}</div>
                            </div>
                            <div className="flex-1 relative">
                                <CodeEditor
                                    projectId={projectId}
                                    branch={currentBranch}
                                    filePath={selectedFile}
                                    isOwner={isOwner}
                                    theme={theme}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
                            <div className="w-20 h-20 mb-6 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center shadow-inner">
                                <FaCode className="text-4xl opacity-30 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">No File Selected</h3>
                            <p className="text-sm max-w-xs text-center leading-relaxed opacity-80">Select a file from the explorer on the left to start editing.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Branch Modal */}
            {showBranchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowBranchModal(false)}>
                    <div className="w-full max-w-md glass-panel bg-[var(--bg-main)] rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[var(--border-subtle)]">
                            <h2 className="text-lg font-bold">Create New Branch</h2>
                        </div>
                        <form onSubmit={handleCreateBranch} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Branch Name</label>
                                <input name="branchName" className="input-new" placeholder="feature/new-feature" required autoFocus />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">Base branch: <span className="font-mono text-[var(--color-primary)]">{currentBranch}</span></p>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowBranchModal(false)} className="btn-ghost-new rounded-lg px-4 py-2">Cancel</button>
                                <button type="submit" className="btn-primary-new px-6 py-2 rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Collaborator Modal */}
            {showCollabModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCollabModal(false)}>
                    <div className="w-full max-w-md glass-panel bg-[var(--bg-main)] rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[var(--border-subtle)]">
                            <h2 className="text-lg font-bold">Invite Collaborator</h2>
                        </div>
                        <form onSubmit={handleAddCollaborator} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input name="username" className="input-new" placeholder="GitHub username" required autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Permission Level</label>
                                <select name="role" className="input-new">
                                    <option value="write">Write (Can edit & push)</option>
                                    <option value="read">Read (View only)</option>
                                    <option value="admin">Admin (Full access)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCollabModal(false)} className="btn-ghost-new rounded-lg px-4 py-2">Cancel</button>
                                <button type="submit" className="btn-primary-new px-6 py-2 rounded-lg">Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectView;
