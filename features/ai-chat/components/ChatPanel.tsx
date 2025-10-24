

import React, { useRef, useEffect, useState } from 'react';
// FIX: Import `ChatMessage` component.
import { Message, ChatMessage } from './ChatMessage';
import { CloseIcon, SparklesIcon, PaperclipIcon, RobotIcon, StopIcon } from '../../../shared/ui/icons';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    isAgentRunning: boolean;
    isLoading: boolean;
    runAgent: (goal: string, files: File[]) => void;
    stopAgent: () => void;
    handleNormalSubmit: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
    isOpen, onClose, messages, input, setInput, files, setFiles, isAgentRunning, isLoading, runAgent, stopAgent, handleNormalSubmit 
}) => {
    const [isAgentMode, setIsAgentMode] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, files]);
    
    useEffect(() => {
        if(isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300); // Wait for transition
        } else {
            // Reset local UI state when closing, but don't stop the agent
            setFiles([]);
            setInput('');
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (fileToRemove: File) => {
        setFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || (!input.trim() && files.length === 0)) return;

        if (isAgentRunning) {
            stopAgent();
        } else if (isAgentMode) {
            runAgent(input, files);
        } else {
            handleNormalSubmit();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-panel-title"
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-800 shadow-2xl border-l border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="absolute inset-0 bg-sky-500/30 border-4 border-dashed border-sky-400 rounded-lg flex items-center justify-center pointer-events-none z-10 m-2">
                        <p className="text-xl font-bold text-white">Dateien hier ablegen</p>
                    </div>
                )}
                <header className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="text-sky-400" />
                        <h2 id="chat-panel-title" className="text-xl font-bold text-slate-200">KI-Projekt-Chat</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                    <div ref={messagesEndRef} />
                </main>
                <footer className="p-4 border-t border-slate-700 flex-shrink-0">
                    {files.length > 0 && (
                        <div className="mb-2 p-2 border border-slate-600 rounded-md bg-slate-900/50 flex flex-wrap gap-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 bg-slate-700 rounded-full px-3 py-1 text-sm">
                                    <span className="text-slate-200 truncate max-w-[150px]" title={file.name}>{file.name}</span>
                                    <button onClick={() => removeFile(file)} className="text-slate-400 hover:text-white">
                                        <CloseIcon size={4} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                        <div className="flex-grow relative">
                             <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isAgentRunning ? "Agent arbeitet..." : isAgentMode ? "Ziel für Agenten beschreiben..." : "Ihre Anweisung..."}
                                disabled={isLoading || isAgentRunning}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm pl-10 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                            />
                            <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                 <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading || isAgentRunning}
                                    className="text-slate-400 hover:text-sky-400 disabled:opacity-50"
                                    aria-label="Dateien anhängen"
                                    title="Dateien anhängen"
                                >
                                    <PaperclipIcon />
                                </button>
                                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || (!isAgentRunning && (!input.trim() && files.length === 0))}
                            className={`flex items-center justify-center gap-2 w-40 text-white px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed ${
                                isAgentRunning ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500' : 'bg-sky-600 hover:bg-sky-500 focus:ring-sky-500 disabled:bg-slate-600'
                            }`}
                        >
                            {isAgentRunning ? <><StopIcon /> Stoppen</> : isAgentMode ? <><RobotIcon /> Agent starten</> : 'Senden'}
                        </button>
                    </form>
                    <div className="flex items-center justify-center gap-2 mt-3">
                         <label htmlFor="agent-mode-toggle" className={`text-sm font-medium cursor-pointer ${isAgentMode ? 'text-sky-400': 'text-slate-400'}`}>
                           Agenten-Modus
                        </label>
                        <button
                            id="agent-mode-toggle" role="switch" aria-checked={isAgentMode}
                            onClick={() => setIsAgentMode(p => !p)}
                            disabled={isAgentRunning}
                            className={`${isAgentMode ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50`}
                        >
                            <span className={`${isAgentMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};