import React, { useState, useEffect } from 'react';
import { Area, Room, FunctionType, AiFunctionSuggestion, FunctionInstance, DeviceConfig } from '../../../domain';
import { TrashIcon, SettingsIcon, ChevronDownIcon, CopyIcon } from '../../../shared/ui/icons';
import { FunctionCounter } from './FunctionCounter';
import { useRoomSuggestion } from '../../ai-assistant/hooks/useRoomSuggestion';
import { AiSuggestionChip } from '../../ai-assistant/components/AiSuggestionChip';
import { createFunctionInstancesForTemplate } from '../../../adapters/templates/roomTemplates';
import { useProjectContext } from '../../../context/ProjectContext';
import { TemplateSaveModal } from './TemplateSaveModal';

interface RoomCardProps {
    room: Room;
    area: Area;
    roomIndex: number;
    onRoomChange: (updatedRoom: Room) => void;
    onRemoveRoom: () => void;
    isNameDuplicate?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, area, roomIndex, onRoomChange, onRemoveRoom, isNameDuplicate }) => {
    const { project, handleLearnTemplateFromRoom, selectedRoomIds, setSelectedRoomIds } = useProjectContext();
    const roomIdentifier = `${area.abbreviation}.${String(roomIndex + 1).padStart(2, '0')}`;
    const [expandedFunctionType, setExpandedFunctionType] = useState<FunctionType | null>(null);
    const isExpanded = room.isExpanded ?? true;
    const isSelected = selectedRoomIds.includes(room.id);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const [debouncedRoomName, setDebouncedRoomName] = useState(room.name);

    // Debounce room name input to avoid excessive API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedRoomName(room.name);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [room.name]);

    const shouldGetSuggestion = project.aiSettings.enableRoomSuggestions && room.functionInstances.length === 0 && room.name.trim().length > 2;
    const { suggestion, clearSuggestion } = useRoomSuggestion(debouncedRoomName, shouldGetSuggestion);
    
    const toggleExpansion = () => {
        onRoomChange({ ...room, isExpanded: !isExpanded });
    };

    const toggleSelection = (e: React.MouseEvent | React.ChangeEvent) => {
        e.stopPropagation();
        setSelectedRoomIds(prev => {
            if (prev.includes(room.id)) {
                return prev.filter(id => id !== room.id);
            } else {
                return [...prev, room.id];
            }
        });
    };

    const handleFunctionCountChange = (type: FunctionType, newCount: number) => {
        const currentCount = room.functionInstances.filter(inst => inst.type === type).length;
    
        if (newCount === currentCount) return; // No change
    
        // Explicitly handle removal of all instances
        if (newCount === 0) {
            onRoomChange({
                ...room,
                functionInstances: room.functionInstances.filter(inst => inst.type !== type)
            });
            setExpandedFunctionType(null);
        } else if (newCount > currentCount) {
            // Add instances
            const instancesToAdd = newCount - currentCount;
            const newInstances = Array.from({ length: instancesToAdd }, (_, i) => {
                const deviceConfig = project.deviceConfig[type];
                const instance: FunctionInstance = {
                    id: `instance-${Date.now()}-${Math.random()}`,
                    type: type,
                    configSnapshot: JSON.parse(JSON.stringify(deviceConfig))
                };
                if (deviceConfig.isScene) {
                    instance.customData = { sceneName: `Neue Szene ${currentCount + i + 1}` };
                }
                return instance;
            });
            onRoomChange({ ...room, functionInstances: [...room.functionInstances, ...newInstances] });
        } else { // newCount < currentCount and newCount > 0
            // Reduce number of instances
            const otherTypeInstances = room.functionInstances.filter(inst => inst.type !== type);
            const thisTypeInstancesToKeep = room.functionInstances
                .filter(inst => inst.type === type)
                .slice(0, newCount);
            onRoomChange({ ...room, functionInstances: [...otherTypeInstances, ...thisTypeInstancesToKeep] });
        }
    };

    const handleSubFunctionToggle = (instanceId: string, functionName: string, isEnabled: boolean) => {
        onRoomChange({
            ...room,
            functionInstances: room.functionInstances.map(instance =>
                instance.id !== instanceId ? instance : {
                    ...instance,
                    configSnapshot: {
                        ...instance.configSnapshot,
                        functions: instance.configSnapshot.functions.map(func =>
                            func.name === functionName ? { ...func, enabled: isEnabled } : func
                        )
                    }
                }
            )
        });
    };
    
    const handleFeedbackToggle = (instanceId: string, functionName: string, isFeedback: boolean) => {
        onRoomChange({
            ...room,
            functionInstances: room.functionInstances.map(instance =>
                instance.id !== instanceId ? instance : {
                    ...instance,
                    configSnapshot: {
                        ...instance.configSnapshot,
                        functions: instance.configSnapshot.functions.map(func =>
                            func.name === functionName ? { ...func, isFeedback: isFeedback } : func
                        )
                    }
                }
            )
        });
    };

    const handleSceneNameChange = (instanceId: string, newName: string) => {
        onRoomChange({
            ...room,
            functionInstances: room.functionInstances.map(instance =>
                instance.id !== instanceId ? instance : {
                    ...instance,
                    customData: { ...instance.customData, sceneName: newName }
                }
            )
        });
    };

    const toggleFunctionSettings = (e: React.MouseEvent, type: FunctionType) => {
        e.stopPropagation();
        setExpandedFunctionType(prev => (prev === type ? null : type));
    };

    const handleApplySuggestion = (functions: AiFunctionSuggestion) => {
        const newInstances = createFunctionInstancesForTemplate(functions, project.deviceConfig);
        onRoomChange({ ...room, functionInstances: newInstances });
        clearSuggestion();
    };

    const visibleFunctionTypes = Object.entries(project.deviceConfig)
        .filter(([key]) => project.viewOptions.functionTypeVisibility?.[key] !== false);


    return (
        <div className={`bg-slate-700/50 rounded-lg transition-all duration-200 ${isSelected ? 'border-sky-500 ring-1 ring-sky-500' : 'border-slate-600 border'}`}>
            <header 
                className="flex items-center gap-2 p-3 compact-mode:p-2 cursor-pointer"
                onClick={toggleExpansion}
            >
                <div className="flex-shrink-0 pr-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={toggleSelection}
                        onClick={e => e.stopPropagation()}
                        className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500 cursor-pointer"
                        aria-label={`Raum ${room.name} auswählen`}
                    />
                </div>
                <input
                    type="text"
                    value={room.name}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                        onRoomChange({ ...room, name: e.target.value });
                        // Clear suggestion immediately on typing
                        if(suggestion) clearSuggestion();
                    }}
                    placeholder="Raumname"
                    title={isNameDuplicate ? "Dieser Raumname wird in diesem Bereich bereits verwendet." : "Raumname"}
                    className={`flex-grow bg-slate-800 text-sm font-semibold rounded px-2 py-1 focus:outline-none focus:ring-1 ${isNameDuplicate ? 'ring-red-500 ring-2' : 'focus:ring-sky-500'}`}
                />
                 <span className="text-xs font-mono bg-slate-800 text-sky-300 rounded px-2 py-1 select-none">
                    {roomIdentifier}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }} 
                  disabled={room.functionInstances.length === 0}
                  className="p-1 text-slate-400 hover:text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Als Vorlage speichern"
                >
                    <CopyIcon size={4} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRemoveRoom(); }} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4} /></button>
                <ChevronDownIcon className={`transition-transform transform ${isExpanded ? '' : '-rotate-90'}`} />
            </header>
            
            {isExpanded && (
                <div className="p-3 pt-2 compact-mode:p-2 compact-mode:pt-1 border-t border-slate-600/50">
                     {suggestion && (
                        <AiSuggestionChip
                            suggestion={suggestion}
                            onApply={handleApplySuggestion}
                            onDismiss={clearSuggestion}
                        />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 compact-mode:gap-x-2 compact-mode:gap-y-0.5 text-sm">
                        {visibleFunctionTypes.map(([key, configUntyped]) => {
                            // FIX: Cast config to DeviceConfig to resolve TypeScript errors.
                            const config = configUntyped as DeviceConfig;
                            const type = key as FunctionType;
                            const instances = room.functionInstances.filter(inst => inst.type === type);
                            const count = instances.length;
                            const isEnabled = count > 0;
                            const areFunctionSettingsExpanded = expandedFunctionType === type;

                            return (
                               <React.Fragment key={type}>
                                    <div className="flex items-center justify-between col-span-1 py-1.5 compact-mode:py-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`${room.id}-${type}`}
                                                checked={isEnabled}
                                                onChange={(e) => handleFunctionCountChange(type, e.target.checked ? 1 : 0)}
                                                className="h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                                            />
                                            <button
                                                onClick={(e) => isEnabled && toggleFunctionSettings(e, type)}
                                                disabled={!isEnabled}
                                                className={`flex items-center gap-1.5 text-left text-slate-300 ${isEnabled ? 'cursor-pointer hover:text-sky-400' : 'cursor-default opacity-60'}`}
                                            >
                                                <span>{config.description}</span>
                                                {isEnabled && <SettingsIcon size={4} />}
                                            </button>
                                        </div>
                                        {isEnabled && (
                                            <FunctionCounter 
                                                count={count}
                                                onChange={(newCount) => handleFunctionCountChange(type, newCount)}
                                            />
                                        )}
                                    </div>
                                   
                                    {areFunctionSettingsExpanded && isEnabled && (
                                        <div className="sm:col-span-2 mt-1 mb-2 p-3 bg-slate-800/60 rounded-md border border-slate-600/50 animate-fade-in">
                                            {config.isScene ? (
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-sky-300 mb-2">Szenen-Namen</h4>
                                                    {instances.map((instance) => (
                                                        <div key={instance.id} className="flex items-center gap-2">
                                                            <label htmlFor={`scene-name-${instance.id}`} className="text-sm text-slate-300 flex-shrink-0">Szene:</label>
                                                            <input
                                                                type="text"
                                                                id={`scene-name-${instance.id}`}
                                                                value={instance.customData?.sceneName || ''}
                                                                onChange={(e) => handleSceneNameChange(instance.id, e.target.value)}
                                                                placeholder="z.B. TV Abend"
                                                                className="w-full bg-slate-700 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                instances.map((instance, index) => (
                                                    <div key={instance.id} className={index > 0 ? "mt-3 pt-3 border-t border-slate-700" : ""}>
                                                        <h4 className="text-xs font-bold text-sky-300 mb-2">{config.description} {index + 1}</h4>
                                                        <div className="space-y-2">
                                                            {instance.configSnapshot.functions
                                                                .filter(func => project.viewOptions.subFunctionVisibility?.[instance.type]?.[func.name] !== false)
                                                                .map(func => (
                                                                    <div key={func.name} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md text-sm">
                                                                        <label htmlFor={`${instance.id}-${func.name}-enabled`} className="text-slate-300 cursor-pointer">
                                                                            {func.name}
                                                                        </label>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`${instance.id}-${func.name}-feedback`}
                                                                                    checked={!!func.isFeedback}
                                                                                    onChange={(e) => handleFeedbackToggle(instance.id, func.name, e.target.checked)}
                                                                                    className="h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                                                                                />
                                                                                <label htmlFor={`${instance.id}-${func.name}-feedback`} className="ml-2 text-xs text-slate-400 cursor-pointer">
                                                                                    RM
                                                                                </label>
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`${instance.id}-${func.name}-enabled`}
                                                                                    checked={func.enabled}
                                                                                    onChange={(e) => handleSubFunctionToggle(instance.id, func.name, e.target.checked)}
                                                                                    className="h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                                                                                />
                                                                                <label htmlFor={`${instance.id}-${func.name}-enabled`} className="ml-2 text-xs text-slate-400 cursor-pointer">
                                                                                    Aktiv
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                               </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
            <TemplateSaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(templateName, options) => {
                    handleLearnTemplateFromRoom(room, templateName, options);
                    setIsSaveModalOpen(false);
                }}
                title="Raum als Vorlage speichern"
                initialName={`Vorlage: ${room.name}`}
                options={[{ id: 'functions', label: 'Funktionen übernehmen', checked: true }]}
            />
        </div>
    );
};