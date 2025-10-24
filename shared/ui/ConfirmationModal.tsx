
import React from 'react';
import { CloseIcon, WarningIcon } from './icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Bestätigen',
    cancelText = 'Abbrechen',
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <WarningIcon className="text-yellow-400" />
                        <h2 id="confirmation-title" className="text-xl font-bold text-slate-200">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                
                <main className="p-6 text-slate-300">
                    {children}
                </main>

                <footer className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-500 transition-colors"
                    >
                        {confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );
};
