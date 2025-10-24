import React from 'react';
import { Area, Room } from '../../../domain';
import { TrashIcon, ChevronDownIcon, AddIcon } from '../../../shared/ui/icons';
import { RoomCard } from './RoomCard';
import { useProjectContext } from '../../project/context/ProjectContext';

interface AreaCardProps {
    area: Area;
    onAreaChange: (updatedArea: Area) => void;
    onRemoveArea: () => void;
    onAddRoom: (areaId: string, templateId?: string) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, onAreaChange, onRemoveArea, onAddRoom }) => {
    const { project } = useProjectContext();
    const isExpanded = area.isExpanded ?? true;

    const toggleExpansion = () => {
        onAreaChange({ ...area, isExpanded: !isExpanded });
    };

    const handleRoomChange = (updatedRoom: Room) => {
        onAreaChange({ ...area, rooms: area.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r) });
    };

    const handleRemoveRoom = (roomId: string) => {
        onAreaChange({ ...area, rooms: area.rooms.filter(r => r.id !== roomId) });
    };

    return (
        <div className="bg-slate-700/20 border border-slate-700 rounded-lg">
            <header className="flex items-center p-3 cursor-pointer area-card-header" onClick={toggleExpansion}>
                <input
                    type="text" value={area.name}
                    onChange={e => { e.stopPropagation(); onAreaChange({ ...area, name: e.target.value }); }}
                    onClick={e => e.stopPropagation()} placeholder="Bereichsname"
                    className="flex-grow bg-transparent text-lg font-bold focus:outline-none"
                />
                 <label className="text-sm text-slate-400 mr-2">Kürzel:</label>
                <input
                    type="text" value={area.abbreviation} maxLength={3}
                    onChange={e => { e.stopPropagation(); onAreaChange({ ...area, abbreviation: e.target.value.toUpperCase() }); }}
                    onClick={e => e.stopPropagation()}
                    className="w-16 bg-slate-800 text-center rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <label className="text-sm text-slate-400 ml-4 mr-2">HG:</label>
                <input
                    type="number" min="0" max="31" value={area.mainGroup}
                    onChange={e => { e.stopPropagation(); onAreaChange({ ...area, mainGroup: parseInt(e.target.value, 10) || 0 }); }}
                    onClick={e => e.stopPropagation()}
                    className="w-16 bg-slate-800 text-center rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button onClick={(e) => { e.stopPropagation(); onRemoveArea(); }} className="p-2 text-slate-400 hover:text-red-400 ml-2"><TrashIcon /></button>
                <ChevronDownIcon className={`transition-transform transform ${isExpanded ? '' : '-rotate-90'}`} />
            </header>
            {isExpanded && (
                <div className="p-3 border-t border-slate-700 area-card-content">
                    <div className="space-y-3 area-card-rooms">
                      {area.rooms.map((room, index) => (
                          <RoomCard
                              key={room.id}
                              room={room} area={area} roomIndex={index}
                              onRoomChange={handleRoomChange}
                              onRemoveRoom={() => handleRemoveRoom(room.id)}
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
        </div>
    );
};