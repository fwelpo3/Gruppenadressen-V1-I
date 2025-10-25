import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Project, Area, AiProjectSuggestion, Room, RoomFunctionsTemplate, CustomRoomTemplate, ExportRow, FunctionType, FunctionInstance, CustomAreaTemplate } from '../domain';
import { generateExportRows } from '../domain';
import { generateCsv } from '../adapters/exporters/csv';
import { PROJECT_TEMPLATES, createFunctionInstancesForTemplate } from '../adapters/templates/roomTemplates';
import { getInitialProject, loadProject, saveProject } from '../adapters/persistence/localStorage';
import { downloadFile } from '../shared/utils/files';
import { useToast } from './ToastContext';

interface ProjectContextType {
    project: Project;
    setProject: (updater: React.SetStateAction<Project>) => void;
    exportRows: ExportRow[];
    selectedRoomIds: string[];
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>;
    handleProjectChange: (field: keyof Project, value: any) => void;
    handleTemplateChange: (templateKey: string) => void;
    handleResetProject: () => void;
    handleReplaceProject: (newProject: Project) => void;
    handleDownloadCsv: () => void;
    handleAddArea: () => void;
    handleLearnTemplateFromArea: (areaId: string, name: string, options: Record<string, boolean>) => void;
    handleAddAreaFromTemplate: (templateId: string) => void;
    handleApplyAiSuggestion: (suggestion: AiProjectSuggestion) => void;
    handleLearnTemplateFromRoom: (room: Room, name: string, options: Record<string, boolean>) => void;
    handleBulkAddFunction: (type: FunctionType) => void;
    handleBulkRemoveFunction: (type: FunctionType) => void;
    handleUndo: () => void;
    handleRedo: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Helper function to increment abbreviation
const incrementAbbreviation = (abbr: string): string => {
    // Find number at the end of the string
    const match = abbr.match(/^(.*?)(\d+)$/);
    if (match) {
        const prefix = match[1];
        const numberStr = match[2];
        const newNumber = parseInt(numberStr, 10) + 1;
        // Preserve padding if it exists (e.g., '01' becomes '02')
        const newNumberStr = String(newNumber).padStart(numberStr.length, '0');
        return `${prefix}${newNumberStr}`;
    }
    // If no number at the end, just append '2'.
    return `${abbr}2`;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [history, setHistory] = useState<Project[]>([loadProject()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    
    const project = useMemo(() => history[historyIndex], [history, historyIndex]);

    const setProject = useCallback((updater: React.SetStateAction<Project>) => {
        const currentProject = history[historyIndex];
        const newProject = typeof updater === 'function' 
            ? (updater as (prevState: Project) => Project)(currentProject) 
            : updater;

        if (JSON.stringify(newProject) === JSON.stringify(currentProject)) {
            return;
        }

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newProject);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    useEffect(() => {
        saveProject(project);
    }, [project]);

    const exportRows = useMemo((): ExportRow[] => {
        if (project.areas.length === 0) return [];
        return generateExportRows(project);
    }, [project]);

    const handleProjectChange = useCallback((field: keyof Project, value: any) => {
        setProject(p => ({ ...p, [field]: value }));
    }, [setProject]);
    
    const handleTemplateChange = useCallback((templateKey: string) => {
        if (!templateKey) {
            setProject(p => ({ ...p, name: 'Neues Projekt', areas: [] }));
            return;
        }
        const template = PROJECT_TEMPLATES[templateKey];
        if (template) {
            const newAreas = template.areas.map(areaProto => ({
                ...areaProto,
                id: `area-${Math.random()}`,
                isExpanded: true,
                rooms: areaProto.rooms.map(roomProto => ({
                    id: `room-${Math.random()}`,
                    name: roomProto.name,
                    isExpanded: true,
                    functionInstances: createFunctionInstancesForTemplate(roomProto.functions, project.deviceConfig)
                }))
            }));
            setProject(p => ({ ...p, name: template.name, areas: newAreas }));
        }
    }, [project.deviceConfig, setProject]);
    
    const handleAddArea = useCallback(() => {
        const { areas, viewOptions } = project;
        const lastArea = areas[areas.length - 1];
        let newArea: Area;
        if(lastArea) {
             newArea = JSON.parse(JSON.stringify(lastArea)); // Deep copy
             newArea.id = `area-${Date.now()}`;
             newArea.name = `${lastArea.name.replace(/\d+$/, '').trim()} ${areas.length + 1}`;
             newArea.abbreviation = incrementAbbreviation(lastArea.abbreviation);
             newArea.mainGroup = lastArea.mainGroup + 1;
             newArea.rooms = []; // Start with no rooms
             newArea.isExpanded = viewOptions.expandNewItems;
        } else {
            newArea = {
                id: `area-${Date.now()}`, name: `Bereich 1`, abbreviation: 'B1',
                mainGroup: 1, rooms: [], isExpanded: viewOptions.expandNewItems,
            };
        }
        setProject(p => ({ ...p, areas: [...p.areas, newArea] }));
        showToast("Neuer Bereich hinzugefügt");
    }, [project, showToast, setProject]);

    const handleLearnTemplateFromArea = useCallback((areaId: string, name: string, options: Record<string, boolean>) => {
        const areaToLearn = project.areas.find(a => a.id === areaId);
        if (!areaToLearn) return;

        if (!name || !name.trim()) return;

        const newTemplate: CustomAreaTemplate = {
            id: `area-template-${Date.now()}`,
            name: name.trim(),
        };
        
        if (options.abbreviation) {
            newTemplate.abbreviation = areaToLearn.abbreviation;
        }
        
        if (options.rooms) {
            newTemplate.rooms = areaToLearn.rooms.map(room => {
                const functions: RoomFunctionsTemplate = {};
                for (const instance of room.functionInstances) {
                    functions[instance.type] = (functions[instance.type] || 0) + 1;
                }
                return {
                    name: room.name,
                    functions,
                };
            });
        }

        setProject(p => ({
            ...p,
            areaTemplates: [...(p.areaTemplates || []), newTemplate]
        }));
        showToast(`Bereichs-Vorlage "${name.trim()}" wurde gespeichert!`);
    }, [project, showToast, setProject]);

     const handleAddAreaFromTemplate = useCallback((templateId: string) => {
        const template = project.areaTemplates?.find(t => t.id === templateId);
        if (!template) return;
    
        const { areas, viewOptions, deviceConfig } = project;
        const lastMainGroup = areas.reduce((max, area) => Math.max(max, area.mainGroup), 0);
        
        const fallbackAbbr = template.name.replace(/[^A-Z]/g, '').substring(0, 3) || template.name.substring(0, 3).toUpperCase();
        
        const newArea: Area = {
            id: `area-${Date.now()}`,
            name: template.name,
            abbreviation: template.abbreviation || fallbackAbbr,
            mainGroup: lastMainGroup + 1,
            isExpanded: viewOptions.expandNewItems,
            rooms: template.rooms ? template.rooms.map(roomTemplate => ({
                id: `room-${Date.now()}-${Math.random()}`,
                name: roomTemplate.name,
                isExpanded: viewOptions.expandNewItems,
                functionInstances: createFunctionInstancesForTemplate(roomTemplate.functions, deviceConfig)
            })) : []
        };
    
        setProject(p => ({ ...p, areas: [...p.areas, newArea] }));
        showToast(`Bereich "${template.name}" aus Vorlage hinzugefügt.`);
    }, [project, showToast, setProject]);

    const handleResetProject = useCallback(() => {
        if(window.confirm("Möchten Sie das gesamte Projekt wirklich zurücksetzen? Alle Daten gehen verloren.")) {
            const initial = getInitialProject();
            setProject(p => ({
                ...initial, 
                name: '', 
                roomTemplates: p.roomTemplates,
                deviceConfig: p.deviceConfig,
                aiSettings: p.aiSettings,
            }));
        }
    }, [setProject]);

    const handleReplaceProject = useCallback((newProject: Project) => {
        // The confirmation should be handled in the UI before calling this function.
        const newHistory = [newProject];
        setHistory(newHistory);
        setHistoryIndex(0);
        showToast("Projekt erfolgreich importiert!");
    }, [showToast]);

    const handleDownloadCsv = useCallback(() => {
        const { areas } = project;
        const mainGroupCounts: Record<number, number> = {};
        const abbreviationCounts: Record<string, number> = {};
        let errorMessages: string[] = [];
        
        for (const area of areas) {
            mainGroupCounts[area.mainGroup] = (mainGroupCounts[area.mainGroup] || 0) + 1;
            if (area.abbreviation.trim()) {
                abbreviationCounts[area.abbreviation.trim()] = (abbreviationCounts[area.abbreviation.trim()] || 0) + 1;
            }
        }

        const duplicateHGs = Object.entries(mainGroupCounts).filter(([, count]) => count > 1).map(([hg]) => hg);
        if (duplicateHGs.length > 0) {
            errorMessages.push(`Doppelte Hauptgruppen gefunden: ${duplicateHGs.join(', ')}`);
        }

        const duplicateAbbrs = Object.entries(abbreviationCounts).filter(([, count]) => count > 1).map(([abbr]) => abbr);
        if (duplicateAbbrs.length > 0) {
             errorMessages.push(`Doppelte Kürzel gefunden: ${duplicateAbbrs.join(', ')}`);
        }
        
        if (errorMessages.length > 0) {
            alert(`Export nicht möglich:\n\n- ${errorMessages.join('\n- ')}`);
            return;
        }
        
        const csvContent = generateCsv(exportRows);
        const safeProjectName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'knx_projekt';
        downloadFile(csvContent, `${safeProjectName}.csv`, 'text/csv;charset=utf-8;');
        showToast('CSV-Export erfolgreich heruntergeladen!');
    }, [project, exportRows, showToast]);

    const handleApplyAiSuggestion = useCallback((suggestion: AiProjectSuggestion) => {
        const lastMainGroup = project.areas.reduce((max, area) => Math.max(max, area.mainGroup), 0);
    
        const newAreas: Area[] = suggestion.map((areaSugg, index) => ({
            id: `area-${Date.now()}-${index}`,
            name: areaSugg.name,
            abbreviation: areaSugg.abbreviation,
            mainGroup: lastMainGroup + index + 1,
            isExpanded: project.viewOptions.expandNewItems,
            rooms: areaSugg.rooms.map((roomSugg, roomIndex) => ({
                id: `room-${Date.now()}-${index}-${roomIndex}`,
                name: roomSugg.name,
                isExpanded: project.viewOptions.expandNewItems,
                functionInstances: createFunctionInstancesForTemplate(roomSugg.functions, project.deviceConfig)
            }))
        }));
    
        setProject(p => ({
            ...p,
            name: p.name || "KI-generiertes Projekt",
            areas: [...p.areas, ...newAreas]
        }));
        showToast("KI-Vorschlag wurde dem Projekt hinzugefügt!");
    }, [project.areas, project.deviceConfig, project.viewOptions.expandNewItems, showToast, setProject]);

    const handleLearnTemplateFromRoom = useCallback((room: Room, name: string, options: Record<string, boolean>) => {
        if (!name || !name.trim()) return;

        const newTemplate: CustomRoomTemplate = {
            id: `template-${Date.now()}`,
            name: name.trim(),
        };

        if (options.functions) {
            const functions: RoomFunctionsTemplate = {};
            for (const instance of room.functionInstances) {
                functions[instance.type] = (functions[instance.type] || 0) + 1;
            }
            newTemplate.functions = functions;
        }


        setProject(p => ({
            ...p,
            roomTemplates: [...p.roomTemplates, newTemplate]
        }));
        showToast(`Vorlage "${name.trim()}" wurde gespeichert!`);
    }, [project, showToast, setProject]);

    const handleBulkAddFunction = useCallback((type: FunctionType) => {
        let roomsChanged = 0;
        setProject(p => {
            const updatedAreas = p.areas.map(area => ({
                ...area,
                rooms: area.rooms.map(room => {
                    if (selectedRoomIds.includes(room.id)) {
                        const hasFunction = room.functionInstances.some(inst => inst.type === type);
                        if (!hasFunction) {
                            roomsChanged++;
                            const newInstance: FunctionInstance = {
                                id: `instance-${Date.now()}-${Math.random()}`,
                                type: type,
                                configSnapshot: JSON.parse(JSON.stringify(p.deviceConfig[type]))
                            };
                            if (type === 'scene') {
                                const sceneCount = room.functionInstances.filter(i => i.type === 'scene').length;
                                newInstance.customData = { sceneName: `Neue Szene ${sceneCount + 1}` };
                            }
                            return { ...room, functionInstances: [...room.functionInstances, newInstance] };
                        }
                    }
                    return room;
                })
            }));
            return { ...p, areas: updatedAreas };
        });
        if (roomsChanged > 0) {
            const funcName = project.deviceConfig[type].description;
            showToast(`${funcName} zu ${roomsChanged} Räumen hinzugefügt.`);
        } else {
            showToast(`Alle ausgewählten Räume hatten diese Funktion bereits.`);
        }
    }, [project.deviceConfig, selectedRoomIds, showToast, setProject]);

    const handleBulkRemoveFunction = useCallback((type: FunctionType) => {
        let roomsChanged = 0;
        setProject(p => {
            const updatedAreas = p.areas.map(area => ({
                ...area,
                rooms: area.rooms.map(room => {
                    if (selectedRoomIds.includes(room.id)) {
                        const initialLength = room.functionInstances.length;
                        const newInstances = room.functionInstances.filter(inst => inst.type !== type);
                        if (newInstances.length < initialLength) {
                            roomsChanged++;
                        }
                        return { ...room, functionInstances: newInstances };
                    }
                    return room;
                })
            }));
            return { ...p, areas: updatedAreas };
        });
        if (roomsChanged > 0) {
            const funcName = project.deviceConfig[type].description;
            showToast(`${funcName} aus ${roomsChanged} Räumen entfernt.`);
        }
    }, [project.deviceConfig, selectedRoomIds, showToast, setProject]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prevIndex => prevIndex - 1);
            showToast("Rückgängig");
        }
    }, [historyIndex, showToast]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prevIndex => prevIndex + 1);
            showToast("Wiederherstellen");
        }
    }, [historyIndex, history.length, showToast]);


    const value = {
        project,
        setProject,
        exportRows,
        selectedRoomIds,
        setSelectedRoomIds,
        handleProjectChange,
        handleTemplateChange,
        handleResetProject,
        handleReplaceProject,
        handleDownloadCsv,
        handleAddArea,
        handleLearnTemplateFromArea,
        handleAddAreaFromTemplate,
        handleApplyAiSuggestion,
        handleLearnTemplateFromRoom,
        handleBulkAddFunction,
        handleBulkRemoveFunction,
        handleUndo,
        handleRedo,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};