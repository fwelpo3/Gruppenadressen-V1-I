

import React, { useState } from 'react';
import { Project, DeviceConfig, GaFunction, FunctionType, CustomRoomTemplate } from '../../../../domain';
import { AddIcon, TrashIcon } from '../../../../shared/ui/icons';
import { useLogging } from '../../../../context/LoggingContext';
import { ConfirmationModal } from '../../../../shared/ui/ConfirmationModal';

interface DeviceConfigEditorProps {
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
}

export const DeviceConfigEditor: React.FC<DeviceConfigEditorProps> = ({ project, setProject }) => {
    const [newDeviceId, setNewDeviceId] = useState('');
    const { log } = useLogging();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

    const handleConfigChange = (id: string, field: keyof DeviceConfig, value: any) => {
        setProject(p => {
            const newDeviceConfig = { ...p.deviceConfig };
            newDeviceConfig[id] = { ...newDeviceConfig[id], [field]: value };
            return { ...p, deviceConfig: newDeviceConfig };
        });
    };

    const handleFunctionChange = (deviceId: string, funcIndex: number, field: keyof GaFunction, value: any) => {
        setProject(p => {
            const newDeviceConfig = { ...p.deviceConfig };
            const oldFunction = newDeviceConfig[deviceId].functions[funcIndex];

            const newFunctions = [...newDeviceConfig[deviceId].functions];
            newFunctions[funcIndex] = { ...newFunctions[funcIndex], [field]: value };
            newDeviceConfig[deviceId] = { ...newDeviceConfig[deviceId], functions: newFunctions };

            let newViewOptions = p.viewOptions;
            if (field === 'name' && oldFunction.name !== value) {
                newViewOptions = JSON.parse(JSON.stringify(p.viewOptions)); // Deep copy
                if (newViewOptions.subFunctionVisibility?.[deviceId]) {
                    const visibility = newViewOptions.subFunctionVisibility[deviceId][oldFunction.name];
                    delete newViewOptions.subFunctionVisibility[deviceId][oldFunction.name];
                    newViewOptions.subFunctionVisibility[deviceId][value] = visibility ?? true;
                }
            }
            
            return { ...p, deviceConfig: newDeviceConfig, viewOptions: newViewOptions };
        });
    };
    
    const handleAddFunction = (deviceId: string) => {
        setProject(p => {
            const newDeviceConfig = { ...p.deviceConfig };
            const newFunction: GaFunction = {
                name: 'Neue Funktion',
                dpt: '1.001',
                offset: 0,
                enabled: true,
                isFeedback: false
            };
            newDeviceConfig[deviceId] = { 
                ...newDeviceConfig[deviceId], 
                functions: [...newDeviceConfig[deviceId].functions, newFunction] 
            };
            return { ...p, deviceConfig: newDeviceConfig };
        });
    };

    const handleRemoveFunction = (deviceId: string, funcIndex: number) => {
         setProject(p => {
            const newDeviceConfig = { ...p.deviceConfig };
            const newFunctions = newDeviceConfig[deviceId].functions.filter((_, i) => i !== funcIndex);
            newDeviceConfig[deviceId] = { ...newDeviceConfig[deviceId], functions: newFunctions };
            return { ...p, deviceConfig: newDeviceConfig };
        });
    };
    
    const handleAddDevice = () => {
        const id = newDeviceId.trim();
        log('info', `Attempting to add new device with id: "${id}"`);

        if (!id) {
            log('warn', 'Add device failed: ID was empty.');
            alert("Die Geräte-ID darf nicht leer sein.");
            return;
        }
        if (!/^[a-z0-9_]+$/.test(id)) {
            log('warn', `Add device failed: Invalid ID format for "${id}".`);
            alert("Ungültige ID. Bitte verwenden Sie nur Kleinbuchstaben, Zahlen und Unterstriche.");
            return;
        }
        if (project.deviceConfig[id]) {
            log('warn', `Add device failed: ID "${id}" already exists.`);
            alert("Diese Geräte-ID existiert bereits.");
            return;
        }

        // FIX: Cast `d` to DeviceConfig to access its properties.
        const allMiddleGroups = Object.values(project.deviceConfig)
            .flatMap(d => [(d as DeviceConfig).middleGroup, (d as DeviceConfig).feedbackMiddleGroup])
            .filter(n => typeof n === 'number') as number[];
        const newMiddleGroup = (allMiddleGroups.length > 0 ? Math.max(...allMiddleGroups) : -1) + 1;
        log('debug', `Calculated new middle group: ${newMiddleGroup}`, { allMiddleGroups });

        const newDevice: DeviceConfig = {
            label: id.charAt(0).toUpperCase(),
            description: id.charAt(0).toUpperCase() + id.slice(1),
            middleGroup: newMiddleGroup,
            feedbackMiddleGroup: newMiddleGroup,
            functions: [],
        };
        log('debug', 'Created new device object:', newDevice);


        setProject(p => {
            log('debug', 'Updating project state to add new device...', { previousProject: p });
            const newViewOptions = JSON.parse(JSON.stringify(p.viewOptions));
            newViewOptions.functionTypeVisibility = { ...newViewOptions.functionTypeVisibility, [id]: true };
            newViewOptions.subFunctionVisibility = { ...newViewOptions.subFunctionVisibility, [id]: {} };
            
            const nextProject = {
                ...p,
                deviceConfig: {
                    ...p.deviceConfig,
                    [id]: newDevice
                },
                viewOptions: newViewOptions,
            };
            log('debug', 'New project state after adding device:', { nextProject });
            return nextProject;
        });
        setNewDeviceId('');
        log('info', `Successfully added new device: "${id}"`);
    };

    const requestDeviceDeletion = (id: string) => {
        log('info', `Requesting to remove device: "${id}"`);
        const isInUse = project.areas.some(area => area.rooms.some(room => room.functionInstances.some(inst => inst.type === id)));
        
        if (isInUse) {
            log('warn', `Remove device failed: Device "${id}" is in use.`);
            alert("Dieser Gerätetyp wird im Projekt verwendet und kann nicht gelöscht werden. Entfernen Sie zuerst alle Instanzen dieses Typs aus den Räumen.");
            return;
        }

        setDeviceToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDeletion = () => {
        if (!deviceToDelete) {
            log('error', 'Confirm deletion called without a device ID.');
            return;
        }
        const id = deviceToDelete;
        log('info', `User confirmed deletion of device: "${id}"`);

        setProject(p => {
            log('debug', 'Current project state before deletion:', { project: p });

            // Creating a deep copy to ensure immutability and state update detection
            const nextProject = JSON.parse(JSON.stringify(p));

            // 1. Remove from deviceConfig
            delete nextProject.deviceConfig[id];
            log('debug', 'Step 1: Removed from deviceConfig.');

            // 2. Remove from viewOptions
            if (nextProject.viewOptions.functionTypeVisibility) {
                delete nextProject.viewOptions.functionTypeVisibility[id];
            }
            if (nextProject.viewOptions.subFunctionVisibility) {
                delete nextProject.viewOptions.subFunctionVisibility[id];
            }
            log('debug', 'Step 2: Cleaned viewOptions.');

            // 3. Remove from roomTemplates
            nextProject.roomTemplates = nextProject.roomTemplates.map((template: CustomRoomTemplate) => {
                if (template.functions && template.functions[id as keyof typeof template.functions]) {
                    const newFunctions = { ...template.functions };
                    delete newFunctions[id as keyof typeof newFunctions];
                    log('debug', `Cleaning template "${template.name}"`, { oldFuncs: template.functions, newFuncs: newFunctions });
                    return { ...template, functions: newFunctions };
                }
                return template;
            });
            log('debug', 'Step 3: Cleaned roomTemplates.');

            log('debug', 'Final project state to be set:', { nextProject });
            return nextProject;
        });

        log('info', `Successfully removed device: "${id}"`);
        setDeviceToDelete(null);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400">
                Hier legen Sie die Standard-Eigenschaften für neu hinzugefügte Funktionen fest. Änderungen hier beeinflussen <strong>nicht</strong> bereits erstellte Funktionen in Ihrer Projektstruktur.
            </p>
            {Object.entries(project.deviceConfig).map(([id, configUntyped]) => {
                // FIX: Cast config to DeviceConfig to resolve TypeScript errors.
                const config = configUntyped as DeviceConfig;
                return (
                <div key={id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sky-400">{config.description} <span className="text-xs text-slate-500 font-mono">({id})</span></h4>
                        <button onClick={() => requestDeviceDeletion(id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <InputField label="Beschreibung" value={config.description} onChange={e => handleConfigChange(id, 'description', e.target.value)} />
                        <InputField label="Label" value={config.label} onChange={e => handleConfigChange(id, 'label', e.target.value)} />
                        <InputField label="Mittelgruppe (Aktion)" type="number" value={config.middleGroup} onChange={e => handleConfigChange(id, 'middleGroup', parseInt(e.target.value) || 0)} />
                        <InputField label="Mittelgruppe (RM)" type="number" value={config.feedbackMiddleGroup || 0} onChange={e => handleConfigChange(id, 'feedbackMiddleGroup', parseInt(e.target.value) || 0)} />
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                        <h5 className="text-sm font-semibold text-slate-300 mb-2">Funktionen (Gruppenadressen-Vorlagen)</h5>
                        <div className="space-y-2">
                            {config.functions.map((func, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-700/50 rounded">
                                    <div className="col-span-3">
                                        <input type="text" value={func.name} placeholder="Name" onChange={e => handleFunctionChange(id, index, 'name', e.target.value)} className="w-full bg-slate-800 p-1 rounded border border-slate-600 text-xs" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="text" value={func.dpt} placeholder="DPT" onChange={e => handleFunctionChange(id, index, 'dpt', e.target.value)} className="w-full bg-slate-800 p-1 rounded border border-slate-600 text-xs" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" value={func.offset} placeholder="Offset" onChange={e => handleFunctionChange(id, index, 'offset', parseInt(e.target.value) || 0)} className="w-full bg-slate-800 p-1 rounded border border-slate-600 text-xs" />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <input type="checkbox" id={`${id}-${index}-feedback`} checked={!!func.isFeedback} onChange={e => handleFunctionChange(id, index, 'isFeedback', e.target.checked)} className="h-4 w-4" />
                                        <label htmlFor={`${id}-${index}-feedback`} className="ml-1 text-xs">RM</label>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <input type="checkbox" id={`${id}-${index}-enabled`} checked={func.enabled} onChange={e => handleFunctionChange(id, index, 'enabled', e.target.checked)} className="h-4 w-4" />
                                         <label htmlFor={`${id}-${index}-enabled`} className="ml-1 text-xs">Aktiv</label>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button onClick={() => handleRemoveFunction(id, index)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4} /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => handleAddFunction(id)} className="w-full text-xs flex items-center justify-center gap-1 text-sky-400 hover:text-sky-300 font-semibold p-1 border-2 border-dashed border-slate-600 hover:border-sky-500 rounded-lg transition-colors">
                                <AddIcon size={4} /> Funktion hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            )})}

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="font-bold text-sky-400 mb-2">Neuen Gerätetyp erstellen</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newDeviceId}
                        onChange={e => setNewDeviceId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="geraete_id (z.b. steckdose)"
                        className="flex-grow bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                        onClick={handleAddDevice}
                        disabled={!newDeviceId.trim()}
                        className="flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        <AddIcon /> Hinzufügen
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Die ID darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten.</p>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    log('info', 'User cancelled device deletion via modal.');
                    setIsConfirmModalOpen(false);
                    setDeviceToDelete(null);
                }}
                onConfirm={handleConfirmDeletion}
                title="Gerätetyp löschen"
                confirmText="Endgültig löschen"
            >
                {deviceToDelete && (
                    <p>
                        Möchten Sie den Gerätetyp <strong className="font-bold text-sky-300">{project.deviceConfig[deviceToDelete]?.description}</strong> wirklich dauerhaft löschen?
                        <br /><br />
                        Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
                )}
            </ConfirmationModal>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string}> = 
({ label, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-xs text-slate-400">{label}</label>
        <input type={type} value={value} onChange={onChange} className="mt-1 w-full bg-slate-700 p-1 rounded border border-slate-600" />
    </div>
);