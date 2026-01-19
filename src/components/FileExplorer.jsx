import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const FileTreeNode = ({ node, onFileSelect, selectedFile, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(depth === 0);

    const handleClick = () => {
        if (node.type === 'directory') {
            setIsOpen(!isOpen);
        } else {
            onFileSelect(node.path);
        }
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
            {node.type === 'directory' && isOpen && node.children && (
                <div>
                    {node.children.map((child, idx) => (
                        <FileTreeNode
                            key={idx}
                            node={child}
                            onFileSelect={onFileSelect}
                            selectedFile={selectedFile}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer = ({ fileTree, onFileSelect, selectedFile }) => {
    if (!fileTree || fileTree.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm">
                <FaFolderOpen className="text-4xl mb-3 opacity-20" />
                <p>No files found</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col custom-scrollbar">
            <div className="flex-1 overflow-y-auto py-2">
                {fileTree.map((node, idx) => (
                    <FileTreeNode
                        key={idx}
                        node={node}
                        onFileSelect={onFileSelect}
                        selectedFile={selectedFile}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileExplorer;
