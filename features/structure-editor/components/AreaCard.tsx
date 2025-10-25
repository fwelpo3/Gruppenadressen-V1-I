import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Area, Room } from '../../../domain';
import { TrashIcon, ChevronDownIcon, AddIcon, CopyIcon } from '../../../shared/ui/icons';
import { RoomCard } from './RoomCard';
import { useProjectContext } from '../../../context/ProjectContext';
import { TemplateSaveModal } from './TemplateSaveModal';

interface AreaCardProps {
    area: Area;
    onAreaChange: (updatedArea: Area) => void;
    onRemoveArea: () => void;
    onAddRoom: (areaId: string, templateId?: string) => void;
    onLearnTemplateFromArea: (areaId: string, name: string, options: Record<string, boolean>) => void;
    isHgDuplicate?: boolean;
    isAbbrDuplicate?: boolean;
    isNameDuplicate?: boolean;
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, onAreaChange, onRemoveArea, onAddRoom, onLearnTemplateFromArea, isHgDuplicate, isAbbrDuplicate, isNameDuplicate }) => {
    const { project, selectedRoomIds, setSelectedRoomIds } = useProjectContext();
    const isExpanded = area.isExpanded ?? true;
    const checkboxRef = useRef<HTMLInputElement>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const toggleExpansion = () => {
        onAreaChange({ ...area, isExpanded: !isExpanded });
    };

    const handleRoomChange = (updatedRoom: Room) => {
        onAreaChange({ ...area, rooms: area.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r) });
    };

    const handleRemoveRoom = (roomId: string) => {
        onAreaChange({ ...area, rooms: area.rooms.filter(r => r.id !== roomId) });
    };
    
    const roomNameCounts = useMemo(() => {
        return area.rooms.reduce((acc, room) => {
            if (room.name.trim()) {
                acc[room.name] = (acc[room.name] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [area.rooms]);

    const roomIdsInArea = useMemo(() => area.rooms.map(r => r.id), [area.rooms]);
    const selectedRoomsInAreaCount = useMemo(() => roomIdsInArea.filter(id => selectedRoomIds.includes(id)).length, [roomIdsInArea, selectedRoomIds]);

    const isAllSelected = roomIdsInArea.length > 0 && selectedRoomsInAreaCount === roomIdsInArea.length;
    const isPartiallySelected = selectedRoomsInAreaCount > 0 && selectedRoomsInAreaCount < roomIdsInArea.length;

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isPartiallySelected;
        }
    }, [isPartiallySelected]);

    const handleAreaSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const shouldSelect = e.target.checked;
        setSelectedRoomIds(prev => {
            if (shouldSelect) {
                // Add all room IDs from this area, avoiding duplicates
                return [...new Set([...prev, ...roomIdsInArea])];
            } else {
                // Remove all room IDs from this area
                return prev.filter(id => !roomIdsInArea.includes(id));
            }
        });
    };


    return (
        <div className="bg-slate-700/20 border border-slate-700 rounded-lg">
            <header className="flex items-center p-3 cursor-pointer compact-mode:p-2" onClick={toggleExpansion}>
                <div className="flex-shrink-0 pr-2">
                    <input
                        ref={checkboxRef}
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleAreaSelectionChange}
                        onClick={e => e.stopPropagation()}
                        className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500 cursor-pointer"
                        aria-label={`Alle Räume in Bereich ${area.name} auswählen`}
                    />
                </div>
                <input
                    type="text" value={area.name}
                    onChange={e => { e.stopPropagation(); onAreaChange({ ...area, name: e.target.value }); }}
                    onClick={e => e.stopPropagation()} placeholder="Bereichsname"
                    title={isNameDuplicate ? "Dieser Bereichsname wird bereits verwendet." : "Bereichsname"}
                    className={`flex-grow bg-transparent text-lg font-bold focus:outline-none ${isNameDuplicate ? 'text-red-400 placeholder:text-red-400/50' : ''}`}
                />
                 <label className="text-sm text-slate-400 mr-2">Kürzel:</label>
                <input
                    type="text" value={area.abbreviation}
                    onChange={e => { e.stopPropagation(); onAreaChange({ ...area, abbreviation: e.target.value.toUpperCase() }); }}
                    onClick={e => e.stopPropagation()}
                    title={isAbbrDuplicate ? "Dieses Kürzel wird bereits verwendet." : "Bereichs-Kürzel"}
                    className={`w-24 bg-slate-800 text-center rounded px-2 py-1 focus:outline-none focus:ring-1 ${isAbbrDuplicate ? 'ring-red-500 ring-2' : 'focus:ring-sky-500'}`}
                />
                <label className="text-sm text-slate-400 ml-4 mr-2">HG:</label>
                <input
                    type="number" min="0" max="31" value={area.mainGroup}
                    onChange={e => { e.stopPropagation(); onAreaChange({ ...area, mainGroup: parseInt(e.target.value, 10) || 0 }); }}
                    onClick={e => e.stopPropagation()}
                    title={isHgDuplicate ? "Diese Hauptgruppe wird bereits verwendet." : "Hauptgruppe"}
                    className={`w-16 bg-slate-800 text-center rounded px-2 py-1 focus:outline-none focus:ring-1 ${isHgDuplicate ? 'ring-red-500 ring-2' : 'focus:ring-sky-500'}`}
                />
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }} 
                    className="p-2 text-slate-400 hover:text-sky-400 ml-2"
                    title="Als Vorlage speichern"
                >
                    <CopyIcon />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRemoveArea(); }} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon /></button>
                <ChevronDownIcon className={`transition-transform transform ${isExpanded ? '' : '-rotate-90'}`} />
            </header>
            {isExpanded && (
                <div className="p-3 border-t border-slate-700 compact-mode:p-2">
                    <div className="space-y-3 compact-mode:space-y-2">
                      {area.rooms.map((room, index) => (
                          <RoomCard
                              key={room.id}
                              room={room} area={area} roomIndex={index}
                              onRoomChange={handleRoomChange}
                              onRemoveRoom={() => handleRemoveRoom(room.id)}
                              isNameDuplicate={room.name.trim() ? roomNameCounts[room.name] > 1 : false}
                          />
                      ))}
                    </div>
                     <div className="mt-4 flex gap-2">
                        <button onClick={() => onAddRoom(area.id)} className="flex-1 text-center text-sm flex items-center justify-center gap-1 text-sky-400 hover:text-sky-300 font-semibold p-2 border-2 border-dashed border-slate-600 hover:border-sky-500 rounded-lg transition-colors">
                             <AddIcon /> Raum hinzufügen
                        </button>
                        {project.roomTemplates.length > 0 && (
                            <select onChange={(e) => onAddRoom(area.id, e.target.value)} value="" className="bg-slate-700 border border-slate-600 rounded-lg text-sm p-2 text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500">
                                <option value="" disabled>Vorlage...</option>
                                {project.roomTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}
                    </div>
                </div>
            )}
            <TemplateSaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(templateName, options) => {
                    onLearnTemplateFromArea(area.id, templateName, options);
                    setIsSaveModalOpen(false);
                }}
                title="Bereich als Vorlage speichern"
                initialName={`Vorlage: ${area.name}`}
                options={[
                    { id: 'abbreviation', label: 'Kürzel übernehmen', checked: true },
                    { id: 'rooms', label: 'Räume und Funktionen übernehmen', checked: true }
                ]}
            />
        </div>
    );
};