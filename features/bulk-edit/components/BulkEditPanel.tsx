import React from 'react';
import { FunctionType, DeviceConfig } from '../../../domain';
import { AddIcon, TrashIcon } from '../../../shared/ui/icons';
import { useProjectContext } from '../../../context/ProjectContext';

export const BulkEditPanel: React.FC = () => {
    const { project, selectedRoomIds, setSelectedRoomIds, handleBulkAddFunction, handleBulkRemoveFunction } = useProjectContext();

    const handleClearSelection = () => {
        setSelectedRoomIds([]);
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-4 sticky top-24 flex flex-col gap-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-200">Bulk-Bearbeitung</h2>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-sky-300 font-semibold">{selectedRoomIds.length} Räume ausgewählt</p>
                    <button
                        onClick={handleClearSelection}
                        className="text-xs text-slate-400 hover:text-white hover:underline"
                    >
                        Auswahl aufheben
                    </button>
                </div>
            </div>

            <div className="space-y-3 border-t border-slate-700 pt-4">
                <h3 className="text-base font-semibold text-slate-300 mb-2">Funktionen anpassen</h3>
                {Object.entries(project.deviceConfig).map(([key, configUntyped]) => {
                    // FIX: Cast config to DeviceConfig to resolve TypeScript errors.
                    const config = configUntyped as DeviceConfig;
                    const type = key as FunctionType;
                    return (
                        <div key={type} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                            <span className="text-sm font-medium text-slate-200">{config.description}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleBulkAddFunction(type)}
                                    className="flex items-center gap-1 bg-green-600/50 text-green-200 px-2 py-1 rounded-md text-xs font-semibold hover:bg-green-600 hover:text-white"
                                    title={`Fügt '${config.description}' zu allen ausgewählten Räumen hinzu, die diese Funktion noch nicht haben.`}
                                >
                                    <AddIcon size={4} /> Hinzufügen
                                </button>
                                <button
                                    onClick={() => handleBulkRemoveFunction(type)}
                                    className="flex items-center gap-1 bg-red-600/50 text-red-200 px-2 py-1 rounded-md text-xs font-semibold hover:bg-red-600 hover:text-white"
                                    title={`Entfernt alle '${config.description}'-Funktionen aus allen ausgewählten Räumen.`}
                                >
                                    <TrashIcon size={4} /> Entfernen
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
             <p className="text-xs text-slate-500 text-center mt-2">
                Änderungen werden auf alle ausgewählten Räume angewendet.
            </p>
        </div>
    );
};