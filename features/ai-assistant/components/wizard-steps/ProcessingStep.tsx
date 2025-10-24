import React, { useState, useEffect } from 'react';

export const ProcessingStep: React.FC = () => {
    const messages = ["Analysiere Projektbeschreibung...", "Erkenne Räume im Grundriss...", "Weise Standardfunktionen zu...", "Strukturiere das Projekt..."];
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setMessage(messages[i]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
            <p className="text-lg font-semibold text-slate-300">{message}</p>
            <p className="text-sm text-slate-400">Die KI denkt nach. Dies kann einen Moment dauern.</p>
        </div>
    );
};
