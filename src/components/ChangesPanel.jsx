import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes, FaClock, FaCode, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChangesPanel = ({ projectId, branch, isOwner }) => {
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChange, setSelectedChange] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    const { user } = useAuth();

    useEffect(() => {
        fetchChanges();
    }, [projectId, branch, statusFilter]);

    const fetchChanges = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/changes/${projectId}/${branch}?status=${statusFilter}`);
            setChanges(response.data.changes);
        } catch (error) {
            console.error('Failed to fetch changes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (changeId) => {
        try {
            await api.post(`/changes/${changeId}/approve`);
            toast.success('Change approved successfully');
            fetchChanges();
            setSelectedChange(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve change');
        }
    };

    const handleReject = async (changeId) => {
        try {
            const comment = prompt('Reason for rejection (optional):');
            await api.post(`/changes/${changeId}/reject`, { comment });
            toast.success('Change rejected');
            fetchChanges();
            setSelectedChange(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject change');
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
                <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
                    <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2 mb-3">
                        <FaClock className="text-[var(--color-primary)]" />
                        Change History
                    </h3>

                    {/* Tabs */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === 'approved'
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === 'rejected'
                                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                }`}
                        >
                            Rejected
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
            <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
                <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2 mb-3">
                    <FaClock className="text-[var(--color-primary)]" />
                    Change History
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold">
                        {changes.length}
                    </span>
                </h3>

                {/* Tabs */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setStatusFilter('approved')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === 'approved'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === 'rejected'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {changes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-[var(--text-secondary)] h-full">
                        <FaCheck className="text-4xl mb-3 opacity-20" />
                        <p className="text-sm font-semibold">
                            {statusFilter === 'pending' && 'No pending changes'}
                            {statusFilter === 'approved' && 'No approved changes'}
                            {statusFilter === 'rejected' && 'No rejected changes'}
                        </p>
                        <p className="text-xs mt-2 opacity-60">Try switching tabs to view other changes</p>
                    </div>
                ) : (
                    changes.map((change) => (
                        <div
                            key={change._id}
                            className="p-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-main)] cursor-pointer transition-all group"
                            onClick={() => setSelectedChange(change)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <FaCode className="text-xs text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-mono text-[var(--text-main)] truncate font-medium">
                                            {change.filePath}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <FaUser className="text-[10px]" />
                                        <span className="font-medium">{change.author.username}</span>
                                        <span className="opacity-50">•</span>
                                        <span>{new Date(change.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {/* Show reviewer info for approved/rejected */}
                                    {(change.status === 'approved' || change.status === 'rejected') && change.reviewedBy && (
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
                                            <FaCheck className="text-[10px]" />
                                            <span>Reviewed by {change.reviewedBy.username}</span>
                                            <span className="opacity-50">•</span>
                                            <span>{new Date(change.reviewedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${change.status === 'approved'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                                    : change.status === 'rejected'
                                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {change.status || change.changeType}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Change Detail Modal */}
            {selectedChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[var(--bg-main)] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--border-color)] shadow-2xl">
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                                    <FaCode className="text-[var(--color-primary)]" />
                                    Review Change
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] font-mono mt-0.5">{selectedChange.filePath}</p>
                            </div>
                            <button
                                onClick={() => setSelectedChange(null)}
                                className="p-2 hover:bg-[var(--bg-main)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Author Info */}
                        <div className="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-3">
                                {selectedChange.author.avatar ? (
                                    <img
                                        src={selectedChange.author.avatar}
                                        alt={selectedChange.author.username}
                                        className="w-9 h-9 rounded-full border-2 border-[var(--border-color)]"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {selectedChange.author.username[0].toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-[var(--text-main)]">{selectedChange.author.username}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        {new Date(selectedChange.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Diff View */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                                <pre className="p-0 m-0 font-mono text-xs leading-relaxed">
                                    {selectedChange.diff.split('\n').map((line, idx) => {
                                        let bgColor = '';
                                        let textColor = 'text-[var(--text-main)]';
                                        let borderLeft = '';

                                        if (line.startsWith('+') && !line.startsWith('+++')) {
                                            bgColor = 'bg-green-500/10';
                                            textColor = 'text-green-600 dark:text-green-400';
                                            borderLeft = 'border-l-2 border-green-500';
                                        } else if (line.startsWith('-') && !line.startsWith('---')) {
                                            bgColor = 'bg-red-500/10';
                                            textColor = 'text-red-600 dark:text-red-400';
                                            borderLeft = 'border-l-2 border-red-500';
                                        } else if (line.startsWith('@@')) {
                                            bgColor = 'bg-blue-500/10';
                                            textColor = 'text-blue-600 dark:text-blue-400';
                                        } else if (line.startsWith('+++') || line.startsWith('---')) {
                                            textColor = 'text-[var(--text-secondary)] font-semibold';
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                className={`px-4 py-0.5 ${bgColor} ${textColor} ${borderLeft}`}
                                            >
                                                {line || ' '}
                                            </div>
                                        );
                                    })}
                                </pre>
                            </div>
                        </div>

                        {/* Actions */}
                        {isOwner && (
                            <div className="p-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                                <button
                                    onClick={() => handleReject(selectedChange._id)}
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow"
                                >
                                    <FaTimes className="text-[10px]" /> Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedChange._id)}
                                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow"
                                >
                                    <FaCheck className="text-[10px]" /> Approve
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangesPanel;
