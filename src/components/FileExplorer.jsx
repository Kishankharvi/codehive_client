import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaPlus, FaTrash, FaEdit, FaFolderPlus } from 'react-icons/fa';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';

const FileTreeNode = ({ node, onFileSelect, selectedFile, depth = 0, onRefresh, projectId, branch }) => {
    const [isOpen, setIsOpen] = useState(depth === 0);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newName, setNewName] = useState(node.name);

    const handleClick = () => {
        if (node.type === 'directory') {
            setIsOpen(!isOpen);
        } else {
            onFileSelect(node.path);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${node.name}?`)) {
            return;
        }

        try {
            await fileAPI.deleteFile(projectId, branch, node.path);
            toast.success(`${node.type === 'directory' ? 'Folder' : 'File'} deleted successfully`);
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
        setShowContextMenu(false);
    };

    const handleRename = async () => {
        if (!newName || newName === node.name) {
            setShowRenameModal(false);
            return;
        }

        const pathParts = node.path.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');

        try {
            await fileAPI.renameFile(projectId, branch, node.path, newPath);
            toast.success('Renamed successfully');
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to rename');
        }
        setShowRenameModal(false);
        setShowContextMenu(false);
    };

    const isSelected = selectedFile === node.path;

    return (
        <div>
            <div
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all duration-200 text-sm border-l-2
                    ${isSelected
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)] font-medium'
                        : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
                    }`}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                <span className={`text-[10px] items-center text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                    {node.type === 'directory' && <FaChevronRight />}
                </span>

                <span className={`flex items-center text-sm ${node.type === 'directory' ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {node.type === 'directory' ? (
                        isOpen ? <FaFolderOpen /> : <FaFolder />
                    ) : (
                        <FaFile />
                    )}
                </span>
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis truncate ml-0.5 select-none">{node.name}</span>
            </div>

            {/* Context Menu */}
            {showContextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowContextMenu(false)}
                    />
                    <div
                        className="fixed z-50 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 min-w-[160px]"
                        style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
                    >
                        <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-[var(--text-main)]"
                            onClick={() => {
                                setShowRenameModal(true);
                                setShowContextMenu(false);
                            }}
                        >
                            <FaEdit /> Rename
                        </button>
                        <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-red-500"
                            onClick={handleDelete}
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                </>
            )}

            {/* Rename Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-[var(--bg-main)] rounded-lg p-6 w-96 border border-[var(--border-color)]">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--text-main)]">Rename {node.type === 'directory' ? 'Folder' : 'File'}</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleRename}
                                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                            >
                                Rename
                            </button>
                            <button
                                onClick={() => {
                                    setShowRenameModal(false);
                                    setNewName(node.name);
                                }}
                                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-main)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {node.type === 'directory' && isOpen && node.children && (
                <div>
                    {node.children.map((child, idx) => (
                        <FileTreeNode
                            key={idx}
                            node={child}
                            onFileSelect={onFileSelect}
                            selectedFile={selectedFile}
                            depth={depth + 1}
                            onRefresh={onRefresh}
                            projectId={projectId}
                            branch={branch}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer = ({ fileTree, onFileSelect, selectedFile, onRefresh, projectId, branch }) => {
    const [showNewFileModal, setShowNewFileModal] = useState(false);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');

    const handleCreateFile = async () => {
        if (!newFileName) {
            toast.error('Please enter a file name');
            return;
        }

        try {
            await fileAPI.createFile(projectId, branch, newFileName, '');
            toast.success('File created successfully');
            setNewFileName('');
            setShowNewFileModal(false);
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create file');
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName) {
            toast.error('Please enter a folder name');
            return;
        }

        try {
            await fileAPI.createDirectory(projectId, branch, newFolderName);
            toast.success('Folder created successfully');
            setNewFolderName('');
            setShowNewFolderModal(false);
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create folder');
        }
    };

    if (!fileTree || fileTree.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-3 border-b border-[var(--border-color)] flex gap-2">
                    <button
                        onClick={() => setShowNewFileModal(true)}
                        className="flex-1 px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm"
                    >
                        <FaPlus /> New File
                    </button>
                    <button
                        onClick={() => setShowNewFolderModal(true)}
                        className="flex-1 px-3 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center gap-2 text-sm text-[var(--text-main)]"
                    >
                        <FaFolderPlus /> New Folder
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm">
                    <FaFolderOpen className="text-4xl mb-3 opacity-20" />
                    <p>No files found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col custom-scrollbar">
            {/* Action Buttons */}
            <div className="p-3 border-b border-[var(--border-color)] flex gap-2">
                <button
                    onClick={() => setShowNewFileModal(true)}
                    className="flex-1 px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm"
                    title="Create new file"
                >
                    <FaPlus /> File
                </button>
                <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="flex-1 px-3 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center gap-2 text-sm text-[var(--text-main)]"
                    title="Create new folder"
                >
                    <FaFolderPlus /> Folder
                </button>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto py-2">
                {fileTree.map((node, idx) => (
                    <FileTreeNode
                        key={idx}
                        node={node}
                        onFileSelect={onFileSelect}
                        selectedFile={selectedFile}
                        onRefresh={onRefresh}
                        projectId={projectId}
                        branch={branch}
                    />
                ))}
            </div>

            {/* New File Modal */}
            {showNewFileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-[var(--bg-main)] rounded-lg p-6 w-96 border border-[var(--border-color)]">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--text-main)]">Create New File</h3>
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="e.g., src/index.js"
                            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                        />
                        <p className="text-xs text-[var(--text-secondary)] mt-2">Include path if creating in subdirectory</p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleCreateFile}
                                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewFileModal(false);
                                    setNewFileName('');
                                }}
                                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-main)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-[var(--bg-main)] rounded-lg p-6 w-96 border border-[var(--border-color)]">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--text-main)]">Create New Folder</h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="e.g., src/components"
                            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <p className="text-xs text-[var(--text-secondary)] mt-2">Include full path for nested folders</p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleCreateFolder}
                                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewFolderModal(false);
                                    setNewFolderName('');
                                }}
                                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-main)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
