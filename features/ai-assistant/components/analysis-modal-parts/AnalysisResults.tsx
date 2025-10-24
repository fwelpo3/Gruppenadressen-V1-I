import React from 'react';
import { AiAnalysisResult, AiAnalysisFinding } from '../../../../domain';
import { FindingCard } from './FindingCard';

export const AnalysisResults: React.FC<{
    results: AiAnalysisResult;
    onProposeFix: (finding: AiAnalysisFinding) => void;
    isFixing: boolean;
}> = ({ results, onProposeFix, isFixing }) => {
    const hasContent = results.consistency.length > 0 || results.completeness.length > 0 || results.optimizations.length > 0;

    if (!hasContent) {
         return (
            <div className="text-center p-8">
                <h4 className="text-lg font-semibold text-green-400">Alles Bestens!</h4>
                <p className="text-slate-300 mt-2">Die KI hat keine unmittelbaren Probleme oder Verbesserungsvorschläge gefunden. Ihr Projekt hat eine solide Struktur.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {results.consistency.length > 0 && (
                <section>
                    <h4 className="text-lg font-bold text-sky-300 mb-2">Konsistenz</h4>
                    <div className="space-y-2">
                        {results.consistency.map((f, i) => <FindingCard key={`con-${i}`} finding={f} onProposeFix={onProposeFix} isFixing={isFixing} />)}
                    </div>
                </section>
            )}
             {results.completeness.length > 0 && (
                <section>
                    <h4 className="text-lg font-bold text-sky-300 mb-2">Vollständigkeit</h4>
                    <div className="space-y-2">
                        {results.completeness.map((f, i) => <FindingCard key={`com-${i}`} finding={f} onProposeFix={onProposeFix} isFixing={isFixing} />)}
                    </div>
                </section>
            )}
             {results.optimizations.length > 0 && (
                <section>
                    <h4 className="text-lg font-bold text-sky-300 mb-2">Optimierungspotenzial</h4>
                    <div className="space-y-2">
                        {results.optimizations.map((f, i) => <FindingCard key={`opt-${i}`} finding={f} onProposeFix={onProposeFix} isFixing={isFixing} />)}
                    </div>
                </section>
            )}
        </div>
    );
};
