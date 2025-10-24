import React, { useState, useEffect } from 'react';
import { useAiProjectGenerator } from '../hooks/useAiProjectGenerator';
import { AiProjectSuggestion } from '../../../domain';
import { CloseIcon, SparklesIcon } from '../../../shared/ui/icons';
import { InputStep } from './wizard-steps/InputStep';
import { ProcessingStep } from './wizard-steps/ProcessingStep';
import { ReviewStep } from './wizard-steps/ReviewStep';

interface AiAssistantWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (suggestion: AiProjectSuggestion) => void;
}

type WizardStep = 'input' | 'processing' | 'review';


export const AiAssistantWizard: React.FC<AiAssistantWizardProps> = ({ isOpen, onClose, onApply }) => {
    const [step, setStep] = useState<WizardStep>('input');
    const { isLoading, error, suggestion, generateProject } = useAiProjectGenerator();

    useEffect(() => {
        if (isOpen) {
            setStep('input');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isLoading) {
            setStep('processing');
        } else if (suggestion) {
            setStep('review');
        } else if (error) {
            setStep('input'); // Go back to input on error, maybe show a toast
        }
    }, [isLoading, suggestion, error]);

    const handleGenerate = async (text: string, file: File | null) => {
        await generateProject(text, file);
    };
    
    const handleRestart = () => {
        setStep('input');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] max-h-[700px] flex flex-col p-6"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center mb-4 flex-shrink-0">
                     <div className="flex items-center gap-2">
                        <SparklesIcon className="text-sky-400" />
                        <h2 className="text-2xl font-bold text-slate-200">KNX AI Projekt-Assistent</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                
                <main className="flex-grow overflow-hidden">
                    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</div>}
                    {step === 'input' && <InputStep onGenerate={handleGenerate} />}
                    {step === 'processing' && <ProcessingStep />}
                    {step === 'review' && suggestion && <ReviewStep initialSuggestion={suggestion} onApply={onApply} onRestart={handleRestart} />}
                </main>
            </div>
        </div>
    );
};
