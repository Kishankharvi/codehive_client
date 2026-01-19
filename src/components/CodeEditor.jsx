import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import socketService from '../services/socketService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaCircle, FaCode } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CodeEditor = ({ projectId, branch, filePath, isOwner, theme = 'dark' }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [loading, setLoading] = useState(true);
    const [cursors, setCursors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const editorRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (filePath) {
            loadFile();
        }
    }, [filePath, branch]);

    useEffect(() => {
        socketService.on('code-update', handleCodeUpdate);
        socketService.on('cursor-update', handleCursorUpdate);

        return () => {
            socketService.off('code-update', handleCodeUpdate);
            socketService.off('cursor-update', handleCursorUpdate);
        };
    }, []);

    const loadFile = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${projectId}/files/${branch}/${filePath}`);
            setCode(response.data.content);

            const ext = filePath.split('.').pop();
            const langMap = {
                js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
                py: 'python', java: 'java', cpp: 'cpp', c: 'c', css: 'css',
                html: 'html', json: 'json', md: 'markdown'
            };
            setLanguage(langMap[ext] || 'plaintext');
            setHasChanges(false);
        } catch (error) {
            toast.error('Failed to load file');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeUpdate = ({ filePath: updatedFile, content, userId }) => {
        if (updatedFile === filePath && userId !== user.id) {
            setCode(content);
        }
    };

    const handleCursorUpdate = ({ userId, username, filePath: cursorFile, position }) => {
        if (cursorFile === filePath && userId !== user.id) {
            setCursors(prev => ({ ...prev, [userId]: { username, position } }));
        }
    };

    const handleEditorChange = (value) => {
        setCode(value);
        setHasChanges(true);

        const editor = editorRef.current;
        const position = editor?.getPosition();

        socketService.sendCodeChange({
            projectId, branch, filePath,
            content: value,
            cursorPosition: position
        });
    };

    const handleCursorPositionChange = (e) => {
        socketService.sendCursorMove({
            projectId, branch, filePath,
            position: e.position
        });
    };

    const handleSave = async () => {
        try {
            await api.post('/changes', {
                projectId, branch, filePath,
                changeType: 'modify',
                newContent: code
            });

            if (isOwner) {
                toast.success('Changes saved');
            } else {
                toast.success('Changes submitted for review');
                socketService.notifyChangeSubmitted({ projectId, branch });
            }
            setHasChanges(false);
        } catch (error) {
            toast.error('Failed to save changes');
        }
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave();
        });
        editor.onDidChangeCursorPosition(handleCursorPositionChange);
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] bg-[var(--bg-main)]">
                <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading file content...</p>
            </div>
        );
    }

    if (!filePath) {
        return (
            <div className="h-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-main)]">
                <p>Select a file to start editing</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)]">
            <div className="flex justify-between items-center px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] h-[50px] shrink-0">
                <div className="flex items-center gap-3">
                    <FaCode className="text-[var(--color-primary)] text-sm" />
                    <span className="font-mono text-sm text-[var(--text-main)] font-medium">{filePath}</span>
                    {hasChanges && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                            Unsaved
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {/* Active Cursors/Users */}
                    <div className="flex -space-x-2">
                        {Object.values(cursors).map((cursor, idx) => (
                            <div
                                key={idx}
                                className="relative group"
                                title={cursor.username}
                            >
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                    style={{ background: `hsl(${idx * 137}, 70%, 50%)` }}
                                >
                                    {cursor.username[0].toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm
                            ${hasChanges
                                ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-orange-500/20'
                                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-subtle)]'
                            }`}
                        disabled={!hasChanges}
                    >
                        <FaSave />
                        {isOwner ? 'Save Changes' : 'Propose Change'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: 14,
                        lineHeight: 22,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on"
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
