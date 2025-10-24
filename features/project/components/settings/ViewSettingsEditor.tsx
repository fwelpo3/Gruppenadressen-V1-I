
import React from 'react';
import { Project, GaStructureMode } from '../../../../domain';
import { GaNameTemplateEditor } from '../../../structure-editor/components/GaNameTemplateEditor';

interface ViewSettingsEditorProps {
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const GaStructureSelector: React.FC<{
    currentMode: GaStructureMode;
    onChange: (mode: GaStructureMode) => void;
}> = ({ currentMode, onChange }) => {
    const modes = [
        { id: 'building', title: 'Gebäudesicht', description: 'Struktur nach Bereich → Funktionstyp (Standard)' },
        { id: 'function', title: 'Funktionssicht', description: 'Struktur nach Funktionstyp → Unterfunktion' },
        { id: 'device', title: 'Gerätesicht', description: 'Struktur nach Funktionstyp → Bereich' },
    ];

    return (
        <div className="space-y-2">
            {modes.map(mode => (
                <div key={mode.id}
                     onClick={() => onChange(mode.id as GaStructureMode)}
                     className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${currentMode === mode.id ? 'bg-sky-900/50 border-sky-600' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                >
                    <label className="font-medium text-slate-200 pointer-events-none">{mode.title}</label>
                    <p className="text-xs text-slate-400 pointer-events-none">{mode.description}</p>
                </div>
            ))}
        </div>
    );
};

export const ViewSettingsEditor: React.FC<ViewSettingsEditorProps> = ({ project, setProject }) => {

     const handleGaStructureChange = (mode: GaStructureMode) => {
        setProject(p => ({
            ...p,
            viewOptions: {
                ...p.viewOptions,
                gaStructureMode: mode,
            }
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-sky-400 mb-4">Struktur der Gruppenadressen</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Wählen Sie, wie die Gruppenadressen in der Vorschau und im Export strukturiert werden sollen.
                </p>
                <GaStructureSelector 
                    currentMode={project.viewOptions.gaStructureMode ?? 'building'} 
                    onChange={handleGaStructureChange} 
                />
            </div>

            <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-sky-400 mb-4">Benennung der Gruppenadressen</h3>
                <GaNameTemplateEditor isSettingsPanel={true} />
            </div>

            <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-sky-400 mb-4">Editor-Verhalten</h3>
                <div className="space-y-4">
                    <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                            <label htmlFor="duplicateRoomsOnAdd-toggle" className="font-medium text-slate-300 cursor-pointer select-none">
                                Neuen Raum durch Duplizieren erstellen
                            </label>
                            <p className="text-xs text-slate-400 mt-1">Wenn aktiviert, wird beim Hinzufügen eines Raumes der vorherige als Vorlage kopiert.</p>
                        </div>
                        <button
                            id="duplicateRoomsOnAdd-toggle" role="switch" aria-checked={project.viewOptions.duplicateRoomsOnAdd}
                            onClick={() => setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, duplicateRoomsOnAdd: !p.viewOptions.duplicateRoomsOnAdd } }))}
                            className={`${project.viewOptions.duplicateRoomsOnAdd ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                        >
                            <span className={`${project.viewOptions.duplicateRoomsOnAdd ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                    <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                            <label htmlFor="expandNewItems-toggle" className="font-medium text-slate-300 cursor-pointer select-none">
                                Neue Elemente automatisch ausklappen
                            </label>
                            <p className="text-xs text-slate-400 mt-1">Neu hinzugefügte Bereiche und Räume werden standardmäßig ausgeklappt angezeigt.</p>
                        </div>
                        <button
                            id="expandNewItems-toggle" role="switch" aria-checked={project.viewOptions.expandNewItems}
                            onClick={() => setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, expandNewItems: !p.viewOptions.expandNewItems } }))}
                            className={`${project.viewOptions.expandNewItems ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                        >
                            <span className={`${project.viewOptions.expandNewItems ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};
