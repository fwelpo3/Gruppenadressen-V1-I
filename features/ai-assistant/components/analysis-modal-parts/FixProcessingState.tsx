import React from 'react';

export const FixProcessingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
        <p className="text-lg font-semibold text-slate-300">Erstelle Korrekturvorschlag...</p>
        <p className="text-sm text-slate-400">Die KI arbeitet an einer Lösung für Sie.</p>
    </div>
);
