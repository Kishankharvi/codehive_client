import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const PushToGitHubButton = ({ projectId, project, branch = 'main' }) => {
    const [showModal, setShowModal] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [pushing, setPushing] = useState(false);

    const handlePush = async () => {
        if (!commitMessage.trim()) {
            toast.error('Please enter a commit message');
            return;
        }

        try {
            setPushing(true);
            const response = await api.post(`/projects/${projectId}/push-to-github`, {
                commitMessage,
                branch
            });

            toast.success(response.data.message);
            setShowModal(false);
            setCommitMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to push to GitHub');
        } finally {
            setPushing(false);
        }
    };

    // Don't show button if project doesn't have GitHub repo
    if (!project?.githubRepo) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn-primary-new py-1.5 px-3 rounded-lg text-xs flex items-center gap-2"
                title="Push to GitHub"
            >
                <FaGithub size={12} />
                <span className="hidden lg:inline">Push to GitHub</span>
            </button>

            {/* Commit Message Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[var(--bg-main)] rounded-xl w-full max-w-md border border-[var(--border-color)] shadow-2xl">
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                                <FaGithub className="text-[var(--color-primary)]" />
                                Push to GitHub
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                {project.githubRepo.owner}/{project.githubRepo.name}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                            <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                                Commit Message
                            </label>
                            <textarea
                                value={commitMessage}
                                onChange={(e) => setCommitMessage(e.target.value)}
                                placeholder="Describe your changes..."
                                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                rows={4}
                                autoFocus
                            />

                            {project.lastPushedAt && (
                                <p className="text-xs text-[var(--text-secondary)] mt-2">
                                    Last pushed: {new Date(project.lastPushedAt).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-1.5 border border-[var(--border-color)] rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-main)] text-xs font-medium transition-colors"
                                disabled={pushing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePush}
                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow min-w-[80px]"
                                disabled={pushing}
                            >
                                {pushing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FaGithub className="text-[10px]" /> Push
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PushToGitHubButton;
