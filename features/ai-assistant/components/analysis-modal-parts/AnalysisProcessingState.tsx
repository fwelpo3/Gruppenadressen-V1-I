import React from 'react';

export const AnalysisProcessingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
        <p className="text-lg font-semibold text-slate-300">Analysiere Projektstruktur...</p>
        <p className="text-sm text-slate-400">Die KI prüft Ihr Projekt auf Herz und Nieren.</p>
    </div>
);
