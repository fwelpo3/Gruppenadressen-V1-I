import React from 'react';
import { AiChangeProposal } from '../../../../domain';

export const ChangePreview: React.FC<{ 
    proposal: AiChangeProposal;
    onAccept: () => void;
    onReject: () => void;
}> = ({ proposal, onAccept, onReject }) => {
    return (
        <div className="flex flex-col h-full p-2">
            <h3 className="text-xl font-bold text-sky-300">Vorgeschlagene Änderung</h3>
            <p className="text-slate-400 mt-1 mb-4">Bitte überprüfen Sie den Vorschlag der KI.</p>
            <div className="flex-grow bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-base font-semibold text-slate-200">Zusammenfassung der Änderung:</p>
                <p className="text-slate-300 whitespace-pre-wrap">{proposal.summary}</p>
            </div>
            <div className="mt-4 flex-shrink-0 flex gap-3">
                 <button onClick={onReject} className="w-full bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500">
                    Verwerfen
                </button>
                <button onClick={onAccept} className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-500">
                    Änderung übernehmen
                </button>
            </div>
        </div>
    );
};
