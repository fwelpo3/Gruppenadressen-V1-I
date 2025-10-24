import React from 'react';
import { AiFunctionSuggestion, FunctionType } from '../../../domain';
import { SparklesIcon } from '../../../shared/ui/icons';

interface AiSuggestionChipProps {
    suggestion: AiFunctionSuggestion;
    onApply: (suggestion: AiFunctionSuggestion) => void;
    onDismiss: () => void;
}

const functionLabels: Record<string, string> = {
    lightSwitch: 'Licht (S)',
    lightDim: 'Licht (D)',
    blinds: 'Jalousie',
    heating: 'Heizung',
};

const formatSuggestion = (suggestion: AiFunctionSuggestion): string => {
    return Object.entries(suggestion)
        .map(([key, value]) => `${value}x ${functionLabels[key as FunctionType] || key}`)
        .join(', ');
};

export const AiSuggestionChip: React.FC<AiSuggestionChipProps> = ({ suggestion, onApply, onDismiss }) => {
    const suggestionText = formatSuggestion(suggestion);

    return (
        <div className="bg-sky-900/50 border border-sky-700 rounded-lg p-2.5 mb-3 text-sm animate-fade-in">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="text-sky-400 flex-shrink-0" size={5}/>
                    <div>
                         <p className="font-semibold text-sky-300">KI-Vorschlag:</p>
                         <p className="text-slate-300">{suggestionText}</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button 
                        onClick={() => onApply(suggestion)}
                        className="bg-sky-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-sky-500"
                    >
                        Übernehmen
                    </button>
                    <button 
                        onClick={onDismiss}
                        className="bg-slate-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-slate-500"
                    >
                        Verwerfen
                    </button>
                </div>
            </div>
        </div>
    );
};