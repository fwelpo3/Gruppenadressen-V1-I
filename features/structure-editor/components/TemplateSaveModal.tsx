import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../../../shared/ui/icons';

export interface SaveTemplateOption {
    id: string;
    label: string;
    checked: boolean;
}

interface TemplateSaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, options: Record<string, boolean>) => void;
    title: string;
    initialName: string;
    options: SaveTemplateOption[];
}

export const TemplateSaveModal: React.FC<TemplateSaveModalProps> = ({ isOpen, onClose, onSave, title, initialName, options: initialOptions }) => {
    const [name, setName] = useState(initialName);
    const [options, setOptions] = useState<SaveTemplateOption[]>(initialOptions);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setOptions(initialOptions);
        }
    }, [isOpen, initialName, initialOptions]);

    const handleSave = () => {
        if (name.trim()) {
            const selectedOptions = options.reduce((acc, opt) => {
                acc[opt.id] = opt.checked;
                return acc;
            }, {} as Record<string, boolean>);
            onSave(name.trim(), selectedOptions);
        }
    };

    const handleOptionToggle = (id: string) => {
        setOptions(currentOptions =>
            currentOptions.map(opt =>
                opt.id === id ? { ...opt, checked: !opt.checked } : opt
            )
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="save-template-title">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 id="save-template-title" className="text-xl font-bold text-slate-200">{title}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="template-name" className="block text-sm font-medium text-slate-300 mb-1">
                            Name der Vorlage
                        </label>
                        <input
                            id="template-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    {options.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-2">Zu speichernde Elemente</p>
                            <div className="space-y-2">
                                {options.map(option => (
                                    <div key={option.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`option-${option.id}`}
                                            checked={option.checked}
                                            onChange={() => handleOptionToggle(option.id)}
                                            className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
                                        />
                                        <label htmlFor={`option-${option.id}`} className="ml-2 text-sm text-slate-300 cursor-pointer">
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500">
                        Abbrechen
                    </button>
                    <button onClick={handleSave} disabled={!name.trim()} className="bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed">
                        Speichern
                    </button>
                </footer>
            </div>
        </div>
    );
};
