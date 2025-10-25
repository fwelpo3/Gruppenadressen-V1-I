import React, { useState } from 'react';
import { AiProjectSuggestion, AiAreaSuggestion, FunctionType } from '../../../../domain';
import { TrashIcon } from '../../../../shared/ui/icons';

const functionLabels: Record<string, string> = {
    lightSwitch: 'Licht (Schalten)',
    lightDim: 'Licht (Dimmen)',
    blinds: 'Jalousie',
    heating: 'Heizung',
};

export const ReviewStep: React.FC<{ 
    initialSuggestion: AiProjectSuggestion; 
    onApply: (suggestion: AiProjectSuggestion) => void;
    onRestart: () => void;
}> = ({ initialSuggestion, onApply, onRestart }) => {
    const [suggestion, setSuggestion] = useState<AiProjectSuggestion>(initialSuggestion);

    const handleAreaChange = (areaId: string, field: keyof AiAreaSuggestion, value: string) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? { ...a, [field]: value } : a));
    };

    const handleRoomChange = (areaId: string, roomId: string, field: keyof AiAreaSuggestion['rooms'][0], value: string) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? {
            ...a,
            rooms: a.rooms.map(r => r.id === roomId ? { ...r, [field]: value } : r)
        } : a));
    };

     const handleFunctionChange = (areaId: string, roomId: string, type: FunctionType, count: number) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? {
            ...a,
            rooms: a.rooms.map(r => {
                if (r.id === roomId) {
                    const newFunctions = { ...r.functions };
                    if (count > 0) {
                        newFunctions[type] = count;
                    } else {
                        delete newFunctions[type];
                    }
                    return { ...r, functions: newFunctions };
                }
                return r;
            })
        } : a));
    };
    
    const handleRemoveRoom = (areaId: string, roomId: string) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? {
            ...a,
            rooms: a.rooms.filter(r => r.id !== roomId)
        } : a));
    };
    
    const handleRemoveArea = (areaId: string) => {
        setSuggestion(suggestion.filter(a => a.id !== areaId));
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-sky-400 mb-2">Vorschlag überprüfen</h3>
            <p className="text-sm text-slate-400 mb-4">Hier ist der Vorschlag der KI. Sie können alle Werte anpassen, bevor Sie die Struktur übernehmen.</p>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {suggestion.map(area => (
                    <div key={area.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                             <input type="text" value={area.name} onChange={e => handleAreaChange(area.id, 'name', e.target.value)} className="flex-grow bg-slate-800 text-lg font-bold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                             <input type="text" value={area.abbreviation} onChange={e => handleAreaChange(area.id, 'abbreviation', e.target.value.toUpperCase())} className="w-20 bg-slate-800 text-center rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                             <button onClick={() => handleRemoveArea(area.id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4}/></button>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-slate-600">
                             {area.rooms.map(room => (
                                <div key={room.id} className="bg-slate-800/70 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={room.name} onChange={e => handleRoomChange(area.id, room.id, 'name', e.target.value)} className="flex-grow bg-slate-700 text-sm font-semibold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                                        <button onClick={() => handleRemoveRoom(area.id, room.id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4}/></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        {(['lightSwitch', 'lightDim', 'blinds', 'heating'] as (keyof typeof room.functions)[]).map(type => (
                                            <div key={type} className="flex items-center justify-between">
                                                <label className="text-slate-300">{functionLabels[type] || type}</label>
                                                <input type="number" min="0" value={room.functions[type] || 0} onChange={e => handleFunctionChange(area.id, room.id, type as FunctionType, parseInt(e.target.value) || 0)} className="w-16 bg-slate-900/50 text-center rounded focus:outline-none focus:ring-1 focus:ring-sky-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 flex gap-3">
                <button onClick={onRestart} className="w-full bg-slate-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-slate-500">
                    Verwerfen & Neu starten
                </button>
                <button onClick={() => onApply(suggestion)} className="w-full bg-sky-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-sky-500">
                    Vorschlag übernehmen
                </button>
            </div>
        </div>
    );
};