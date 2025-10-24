import React, { useMemo, useEffect, useRef } from 'react';
import { Area, Room } from '../../../domain';
import { AddIcon, SparklesIcon, ChevronDownIcon } from '../../../shared/ui/icons';
import { createFunctionInstancesForTemplate } from '../../../adapters/templates/roomTemplates';
import { AreaCard } from './AreaCard';
import { useProjectContext } from '../../../context/ProjectContext';
import { ProjectSettings } from './ProjectSettings';

interface StructureEditorProps {
    onStartWithAi: () => void;
}

export const StructureEditor: React.FC<StructureEditorProps> = ({ onStartWithAi }) => {
    const { project, setProject, handleAddArea, selectedRoomIds, setSelectedRoomIds, handleLearnTemplateFromArea, handleAddAreaFromTemplate } = useProjectContext();
    const { areas, viewOptions } = project;
    const allRoomIds = useMemo(() => areas.flatMap(a => a.rooms.map(r => r.id)), [areas]);
    const checkboxRef = useRef<HTMLInputElement>(null);

    const onStructureChange = (newAreas: Area[]) => {
        setProject(p => ({ ...p, areas: newAreas }));
    };

    const handleAreaChange = (updatedArea: Area) => {
        onStructureChange(areas.map(a => a.id === updatedArea.id ? updatedArea : a));
    };
    
    const handleAddRoom = (areaId: string, templateId?: string) => {
        const newAreas = areas.map(area => {
            if (area.id === areaId) {
                let newRoom: Room;
                const template = project.roomTemplates.find(t => t.id === templateId);

                if (template) {
                     newRoom = { 
                         id: `room-${Date.now()}`, 
                         name: template.name, 
                         functionInstances: template.functions 
                            ? createFunctionInstancesForTemplate(template.functions, project.deviceConfig) 
                            : [],
                         isExpanded: viewOptions.expandNewItems,
                    };
                } else {
                    const lastRoom = area.rooms[area.rooms.length - 1];
                    if (lastRoom && viewOptions.duplicateRoomsOnAdd) {
                        newRoom = JSON.parse(JSON.stringify(lastRoom));
                        newRoom.id = `room-${Date.now()}`;
                        newRoom.name = `${lastRoom.name.replace(/\d+$/, '').trim()} ${area.rooms.length + 1}`;
                        newRoom.isExpanded = viewOptions.expandNewItems;
                    } else {
                        newRoom = { 
                            id: `room-${Date.now()}`, 
                            name: `Neuer Raum ${area.rooms.length + 1}`,
                            functionInstances: [],
                            isExpanded: viewOptions.expandNewItems
                        };
                    }
                }
                return { ...area, rooms: [...area.rooms, newRoom] };
            }
            return area;
        });
        onStructureChange(newAreas);
    };

    const handleRemoveArea = (areaId: string) => {
        onStructureChange(areas.filter(a => a.id !== areaId));
    };

    const mainGroupCounts = useMemo(() => {
        return areas.reduce((acc, area) => {
            acc[area.mainGroup] = (acc[area.mainGroup] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);
    }, [areas]);

    const abbreviationCounts = useMemo(() => {
        return areas.reduce((acc, area) => {
            if (area.abbreviation.trim()) {
                acc[area.abbreviation] = (acc[area.abbreviation] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [areas]);
    
    const areaNameCounts = useMemo(() => {
        return areas.reduce((acc, area) => {
            if (area.name.trim()) {
                acc[area.name] = (acc[area.name] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [areas]);

    const isAllSelected = allRoomIds.length > 0 && selectedRoomIds.length === allRoomIds.length;
    const isPartiallySelected = selectedRoomIds.length > 0 && selectedRoomIds.length < allRoomIds.length;
    
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isPartiallySelected;
        }
    }, [isPartiallySelected]);

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedRoomIds(e.target.checked ? allRoomIds : []);
    };


    return (
        <>
            {viewOptions.showProjectSettings && <ProjectSettings />}
            <div className="flex-grow p-4 overflow-y-auto overscroll-contain custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-200">Projektstruktur</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={onStartWithAi} className="flex items-center gap-2 bg-sky-600/50 text-sky-300 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-sky-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                            <SparklesIcon /> KI-Assistent
                        </button>
                        <div className="flex rounded-md shadow-sm bg-slate-600 hover:bg-slate-500 transition-colors">
                            <button onClick={handleAddArea} className={`flex items-center gap-2 text-white px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${project.areaTemplates && project.areaTemplates.length > 0 ? 'rounded-l-md' : 'rounded-md'}`}>
                                <AddIcon /> Bereich
                            </button>
                            {project.areaTemplates && project.areaTemplates.length > 0 && (
                                <div className="relative">
                                    <select 
                                        onChange={(e) => { if(e.target.value) handleAddAreaFromTemplate(e.target.value); }} 
                                        value=""
                                        className="appearance-none bg-transparent text-white pl-2 pr-6 py-1.5 border-l border-slate-500/50 hover:border-slate-400 focus:outline-none text-sm h-full rounded-r-md cursor-pointer"
                                        title="Bereich aus Vorlage erstellen"
                                    >
                                        <option value="" disabled></option>
                                        {project.areaTemplates.map(t => <option key={t.id} value={t.id} className="bg-slate-700">{t.name}</option>)}
                                    </select>
                                    <ChevronDownIcon size={4} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {areas.length > 0 && (
                    <div className="flex items-center gap-3 p-2 mb-4 bg-slate-700/30 border border-slate-700 rounded-lg">
                        <input
                            ref={checkboxRef}
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAllChange}
                            className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500 cursor-pointer"
                            aria-label="Alle Räume auswählen"
                        />
                        <label className="text-sm font-semibold text-slate-300">
                            {selectedRoomIds.length > 0 
                                ? `${selectedRoomIds.length} / ${allRoomIds.length} Räume ausgewählt`
                                : `Alle Räume auswählen`}
                        </label>
                    </div>
                )}

                <div className="space-y-4 compact-mode:space-y-2">
                    {areas.length > 0 ? (
                        areas.map(area => (
                            <AreaCard
                                key={area.id}
                                area={area}
                                onAreaChange={handleAreaChange}
                                onRemoveArea={() => handleRemoveArea(area.id)}
                                onAddRoom={handleAddRoom}
                                onLearnTemplateFromArea={handleLearnTemplateFromArea}
                                isHgDuplicate={mainGroupCounts[area.mainGroup] > 1}
                                isAbbrDuplicate={area.abbreviation.trim() ? abbreviationCounts[area.abbreviation] > 1 : false}
                                isNameDuplicate={area.name.trim() ? areaNameCounts[area.name] > 1 : false}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                            <p>Das Projekt ist leer.</p>
                            <p className="mt-2 text-sm">
                                Starten Sie mit dem <button onClick={onStartWithAi} className="text-sky-400 hover:underline font-semibold">KI-Assistenten</button> oder fügen Sie manuell einen Bereich hinzu.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};