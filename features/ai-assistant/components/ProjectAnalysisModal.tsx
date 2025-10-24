import React, { useState, useEffect } from 'react';
import { Project, AiAnalysisResult, AiAnalysisFinding, AiChangeProposal } from '../../../domain';
import { useAiProjectAnalyzer } from '../hooks/useAiProjectAnalyzer';
import { useAiProjectFixer } from '../hooks/useAiProjectFixer';
import { CloseIcon, SparklesIcon } from '../../../shared/ui/icons';
import { AnalysisProcessingState } from './analysis-modal-parts/AnalysisProcessingState';
import { FixProcessingState } from './analysis-modal-parts/FixProcessingState';
import { AnalysisResults } from './analysis-modal-parts/AnalysisResults';
import { ChangePreview } from './analysis-modal-parts/ChangePreview';
import { useProjectContext } from '../../../context/ProjectContext';


export const ProjectAnalysisModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onApplyChange: (newProject: Project) => void;
    cachedAnalysis: { result: AiAnalysisResult; projectJSON: string; } | null;
    onAnalysisComplete: (result: AiAnalysisResult, projectJSON: string) => void;
}> = ({ isOpen, onClose, onApplyChange, cachedAnalysis, onAnalysisComplete }) => {
    const { project } = useProjectContext();
    const { isLoading: isAnalyzing, error: analysisError, analysisResult, analyzeProject } = useAiProjectAnalyzer();
    const { isLoading: isFixing, error: fixError, proposal, proposeFix, clearProposal } = useAiProjectFixer();
    
    const [displayResult, setDisplayResult] = useState<AiAnalysisResult | null>(null);

    useEffect(() => {
        if (isOpen) {
            clearProposal(); // Always reset proposal state when opening
            const currentProjectJSON = JSON.stringify(project);
            if (cachedAnalysis && cachedAnalysis.projectJSON === currentProjectJSON) {
                setDisplayResult(cachedAnalysis.result);
            } else {
                setDisplayResult(null); 
                analyzeProject(project);
            }
        }
    }, [isOpen, project, cachedAnalysis, analyzeProject, clearProposal]);
    
    useEffect(() => {
        if (analysisResult) {
            setDisplayResult(analysisResult);
            onAnalysisComplete(analysisResult, JSON.stringify(project));
        }
    }, [analysisResult, onAnalysisComplete, project]);

    if (!isOpen) return null;

    const handleRequestFix = async (finding: AiAnalysisFinding) => {
        await proposeFix(project, finding);
    };
    
    const handleAccept = () => {
        if (proposal) {
            onApplyChange(proposal.newProject);
        }
    };

    const currentError = analysisError || fixError;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] max-h-[800px] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                     <div className="flex items-center gap-2">
                        <SparklesIcon className="text-sky-400" />
                        <h2 className="text-2xl font-bold text-slate-200">KI-Projektanalyse</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                
                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {isAnalyzing && <AnalysisProcessingState />}
                    {isFixing && <FixProcessingState />}
                    {currentError && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{currentError}</div>}
                    
                    {!isAnalyzing && !isFixing && !currentError && (
                         proposal 
                            ? <ChangePreview proposal={proposal} onAccept={handleAccept} onReject={clearProposal} />
                            : displayResult 
                                ? <AnalysisResults results={displayResult} onProposeFix={handleRequestFix} isFixing={isFixing}/>
                                : null
                    )}
                </main>

                <footer className="p-4 border-t border-slate-700 text-right">
                    <button onClick={onClose} className="bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500">
                        Schließen
                    </button>
                </footer>
            </div>
        </div>
    );
};