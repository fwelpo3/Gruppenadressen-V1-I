import React from 'react';
import { Area, Room } from '../../../domain';
import { AddIcon, SparklesIcon } from '../../../shared/ui/icons';
import { createFunctionInstancesForTemplate } from '../../../adapters/templates/roomTemplates';
import { AreaCard } from './AreaCard';
import { useProjectContext } from '../../project/context/ProjectContext';

interface StructureEditorProps {
    onStartWithAi: () => void;
}

export const StructureEditor: React.FC<StructureEditorProps> = ({ onStartWithAi }) => {
    const { project, setProject, handleAddArea } = useProjectContext();
    const { areas, viewOptions } = project;

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
                         functionInstances: createFunctionInstancesForTemplate(template.functions, project.deviceConfig),
                         isExpanded: viewOptions.expandNewItems,
                    };
                } else {
                    const lastRoom = area.rooms[area.rooms.length - 1];
                    if (lastRoom) {
                        newRoom = JSON.parse(JSON.stringify(lastRoom));
                        newRoom.id = `room-${Date.now()}`;
                        newRoom.name = `${lastRoom.name.replace(/\d+$/, '')} ${area.rooms.length + 1}`;
                        newRoom.isExpanded = viewOptions.expandNewItems;
                    } else {
                        newRoom = { 
                            id: `room-${Date.now()}`, 
                            name: "Neuer Raum 1", 
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

    return (
        <div className="flex-grow p-4 overflow-y-auto overscroll-contain custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-semibold text-slate-200">Projektstruktur</h2>
                 <div className="flex items-center gap-2">
                    <button onClick={onStartWithAi} className="flex items-center gap-2 bg-sky-600/50 text-sky-300 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-sky-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                        <SparklesIcon /> KI-Assistent
                    </button>
                    <button onClick={handleAddArea} className="flex items-center gap-2 bg-slate-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                        <AddIcon /> Bereich hinzufügen
                    </button>
                </div>
            </div>
            <div className="space-y-4 structure-editor-areas">
                {areas.length > 0 ? (
                    areas.map(area => (
                        <AreaCard
                            key={area.id}
                            area={area}
                            onAreaChange={handleAreaChange}
                            onRemoveArea={() => handleRemoveArea(area.id)}
                            onAddRoom={handleAddRoom}
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
    );
};