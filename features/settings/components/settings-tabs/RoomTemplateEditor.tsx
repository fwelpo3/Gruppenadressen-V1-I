import React, { useState } from 'react';
import { Project, CustomRoomTemplate, RoomFunctionsTemplate, DeviceConfig } from '../../../../domain';
import { AddIcon, TrashIcon } from '../../../../shared/ui/icons';

interface RoomTemplateEditorProps {
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
}

export const RoomTemplateEditor: React.FC<RoomTemplateEditorProps> = ({ project, setProject }) => {
    const [newTemplateName, setNewTemplateName] = useState('');

    const handleAddTemplate = () => {
        if (!newTemplateName.trim()) return;
        const newTemplate: CustomRoomTemplate = {
            id: `template-${Date.now()}`,
            name: newTemplateName,
            functions: {}, // Start with an empty template
        };
        setProject(p => ({ ...p, roomTemplates: [...p.roomTemplates, newTemplate] }));
        setNewTemplateName('');
    };
    
    const handleRemoveTemplate = (templateId: string) => {
        setProject(p => ({ ...p, roomTemplates: p.roomTemplates.filter(t => t.id !== templateId)}));
    };

    const handleFunctionChange = (templateId: string, deviceId: string, count: number) => {
        setProject(p => ({
            ...p,
            roomTemplates: p.roomTemplates.map(t => {
                if (t.id === templateId) {
                    const newFunctions: RoomFunctionsTemplate = { ...t.functions };
                    if (count > 0) {
                        newFunctions[deviceId] = count;
                    } else {
                        delete newFunctions[deviceId];
                    }
                    return { ...t, functions: newFunctions };
                }
                return t;
            })
        }));
    };

    return (
        <div className="space-y-4">
             <div className="flex gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <input
                    type="text" value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value)}
                    placeholder="Name für neue Vorlage"
                    className="flex-grow bg-slate-700 p-2 rounded border border-slate-600"
                />
                <button onClick={handleAddTemplate} disabled={!newTemplateName.trim()} className="flex items-center gap-2 bg-sky-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-sky-500 disabled:bg-slate-500">
                    <AddIcon /> Vorlage erstellen
                </button>
            </div>
            {project.roomTemplates.map(template => (
                <div key={template.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sky-400">{template.name}</h4>
                        <button onClick={() => handleRemoveTemplate(template.id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(project.deviceConfig).map(([deviceId, configUntyped]) => {
                             // FIX: Cast config to DeviceConfig to resolve TypeScript error.
                             const config = configUntyped as DeviceConfig;
                             const count = template.functions?.[deviceId as keyof typeof template.functions] || 0;
                             return (
                                 <div key={deviceId} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                                     <label className="text-slate-300">{config.description}</label>
                                     <input
                                        type="number" min="0" value={count}
                                        onChange={e => handleFunctionChange(template.id, deviceId, parseInt(e.target.value) || 0)}
                                        className="w-16 text-center bg-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                                     />
                                 </div>
                             )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};