import { Project, ExportRow, FunctionType, Room, FunctionInstance, Area } from '../contracts/types';
import { generateGaName } from './name-template';

// --- 1. Gebäudesicht (Standard) ---
const generateBuildingViewRows = (project: Project): ExportRow[] => {
    const rows: ExportRow[] = [];
    const gaNameTemplate = project.viewOptions.gaNameTemplate;

    const middleGroupNames: {[key: string]: string} = {};
    Object.values(project.deviceConfig).forEach(config => {
        middleGroupNames[String(config.middleGroup)] = config.description;
        if (config.feedbackMiddleGroup && config.feedbackMiddleGroup !== config.middleGroup) {
            middleGroupNames[String(config.feedbackMiddleGroup)] = `${config.description} - Rückmeldungen`;
        }
    });

    project.areas.forEach(area => {
        rows.push({
            level: 'main',
            mainGroup: area.mainGroup,
            name: area.name,
        });

        const functionsByMiddleGroup: Map<number, { room: Room, instance: FunctionInstance, isFeedback: boolean }[]> = new Map();

        area.rooms.forEach(room => {
            room.functionInstances.forEach(instance => {
                const { configSnapshot } = instance;
                
                const mainMiddleGroup = configSnapshot.middleGroup;
                if (!functionsByMiddleGroup.has(mainMiddleGroup)) functionsByMiddleGroup.set(mainMiddleGroup, []);
                functionsByMiddleGroup.get(mainMiddleGroup)!.push({ room, instance, isFeedback: false });

                const useSeparateFeedbackGroup = configSnapshot.feedbackMiddleGroup && configSnapshot.feedbackMiddleGroup !== configSnapshot.middleGroup;
                const hasEnabledFeedbackFunctions = configSnapshot.functions.some(f => (f.isFeedback || f.name.includes("RM")) && f.enabled);

                if (useSeparateFeedbackGroup && hasEnabledFeedbackFunctions) {
                    const feedbackMiddleGroup = configSnapshot.feedbackMiddleGroup!;
                    if (!functionsByMiddleGroup.has(feedbackMiddleGroup)) functionsByMiddleGroup.set(feedbackMiddleGroup, []);
                    functionsByMiddleGroup.get(feedbackMiddleGroup)!.push({ room, instance, isFeedback: true });
                }
            });
        });

        const sortedMiddleGroups = Array.from(functionsByMiddleGroup.keys()).sort((a, b) => a - b);

        sortedMiddleGroups.forEach(middleGroup => {
            const groupName = middleGroupNames[String(middleGroup)] || `Mittelgruppe ${middleGroup}`;
            rows.push({
                level: 'middle',
                mainGroup: area.mainGroup,
                middleGroup: middleGroup,
                name: groupName,
            });

            let subAddressCounter = 0;
            let lastRoomId: string | null = null;
            let lastInstanceId: string | null = null;
            
            const functionsInGroup = functionsByMiddleGroup.get(middleGroup)!;
            
            functionsInGroup.sort((a, b) => {
                if (a.room.id !== b.room.id) return a.room.name.localeCompare(b.room.name);
                return a.instance.id.localeCompare(b.instance.id);
            });

            functionsInGroup.forEach(({ room, instance, isFeedback: processingFeedbackGroup }) => {
                if (room.id !== lastRoomId) {
                    if (lastRoomId !== null) {
                         rows.push({
                            level: 'ga', mainGroup: area.mainGroup, middleGroup, sub: subAddressCounter++,
                            name: '-', dpt: '', description: 'Trenner'
                        });
                    }
                    rows.push({
                        level: 'ga', mainGroup: area.mainGroup, middleGroup, sub: subAddressCounter++,
                        name: `--- ${room.name} ---`, dpt: '', description: `Trenner für ${room.name}`
                    });
                    lastRoomId = room.id;
                    lastInstanceId = null;
                }

                // Fügt einen Trenner zwischen verschiedenen Instanzen desselben Funktionstyps im selben Raum hinzu.
                if (lastInstanceId !== null && instance.id !== lastInstanceId) {
                     rows.push({
                        level: 'ga', mainGroup: area.mainGroup, middleGroup, sub: subAddressCounter++,
                        name: '-', dpt: '', description: 'Trenner'
                    });
                }
                lastInstanceId = instance.id;

                const { type, configSnapshot } = instance;
                const roomIndex = area.rooms.findIndex(r => r.id === room.id);
                const instancesInRoom = room.functionInstances.filter(i => i.type === type);
                const instanceIndex = instancesInRoom.findIndex(i => i.id === instance.id);

                const gaDescription = `(${room.name} ${configSnapshot.description} ${instanceIndex + 1})`;
                
                configSnapshot.functions.forEach(func => {
                    if (!func.enabled) return;

                    const isPureFeedbackFunction = func.name.includes('RM') || func.name.toLowerCase().includes('status');

                    if (processingFeedbackGroup) {
                        // We are in the feedback middle group's loop.
                        // Generate a GA if the function is "pure feedback" OR if it's an action function with the RM flag checked.
                        if (isPureFeedbackFunction || func.isFeedback) {
                            const finalFuncName = isPureFeedbackFunction ? func.name : `${func.name} RM`;
                            const gaName = generateGaName(gaNameTemplate, { area, room, roomIndex, instance, instanceIndex, functionName: finalFuncName });
                            rows.push({
                                level: 'ga', mainGroup: area.mainGroup, middleGroup, sub: subAddressCounter++,
                                name: gaName, dpt: func.dpt, description: gaDescription
                            });
                        }
                    } else {
                        // We are in the action middle group's loop.
                        // Do not generate GAs for "pure feedback" functions here.
                        if (isPureFeedbackFunction) return;

                        // Generate the main action GA
                        const finalFuncName = instance.configSnapshot.isScene ? (instance.customData?.sceneName || func.name) : func.name;
                        const gaName = generateGaName(gaNameTemplate, { area, room, roomIndex, instance, instanceIndex, functionName: finalFuncName });
                        rows.push({
                            level: 'ga', mainGroup: area.mainGroup, middleGroup, sub: subAddressCounter++,
                            name: gaName, dpt: func.dpt, description: gaDescription
                        });

                        // If feedback is enabled for this function AND we are NOT using a separate group, generate it here too.
                        const useSeparateFeedbackGroup = configSnapshot.feedbackMiddleGroup && configSnapshot.feedbackMiddleGroup !== configSnapshot.middleGroup;
                        if (func.isFeedback && !useSeparateFeedbackGroup) {
                            const feedbackFuncName = `${func.name} RM`;
                            const feedbackGaName = generateGaName(gaNameTemplate, { area, room, roomIndex, instance, instanceIndex, functionName: feedbackFuncName });
                             rows.push({
                                level: 'ga', mainGroup: area.mainGroup, middleGroup, sub: subAddressCounter++,
                                name: feedbackGaName, dpt: func.dpt, description: gaDescription
                            });
                        }
                    }
                });
            });
        });
    });
    return rows;
};

// --- 2. Funktionssicht ---
const generateFunctionViewRows = (project: Project): ExportRow[] => {
    const rows: ExportRow[] = [];
    const functionTypes = project.deviceConfig;
    const gaNameTemplate = project.viewOptions.gaNameTemplate;

    const mainGroupMapping: { [key: number]: {name: string, type: FunctionType} } = {};
    for (const type in functionTypes) {
        const config = functionTypes[type];
        mainGroupMapping[config.middleGroup] = { name: config.description, type: type };
        if(config.feedbackMiddleGroup && config.feedbackMiddleGroup !== config.middleGroup) {
             mainGroupMapping[config.feedbackMiddleGroup] = { name: `${config.description} - Rückmeldungen`, type: type };
        }
    }

    for (const mainGroupStr of Object.keys(mainGroupMapping).sort((a, b) => Number(a) - Number(b))) {
        const mainGroup = Number(mainGroupStr);
        const { name, type } = mainGroupMapping[mainGroup];

        rows.push({ level: 'main', mainGroup: mainGroup, name });

        const allInstances = project.areas.flatMap(area => 
            area.rooms.flatMap(room => 
                room.functionInstances.filter(inst => inst.type === type).map(instance => ({ area, room, instance }))
            )
        );

        if (allInstances.length === 0) continue;

        const groupedBySubFunction: Map<string, { area: Area, room: Room, instance: FunctionInstance, funcDpt: string }[]> = new Map();
        
        allInstances.forEach(({ area, room, instance }) => {
            instance.configSnapshot.functions.forEach(func => {
                if (!func.enabled) return;
                
                const isPureFeedback = func.name.includes('RM') || func.name.toLowerCase().includes('status');
                const useSeparateFeedbackGroup = instance.configSnapshot.feedbackMiddleGroup && instance.configSnapshot.feedbackMiddleGroup !== instance.configSnapshot.middleGroup;

                // Case 1: We are processing the action group for this function type
                if (mainGroup === instance.configSnapshot.middleGroup) {
                    // Generate action GA if not pure feedback
                    if (!isPureFeedback) {
                         const subFuncName = func.name;
                         if (!groupedBySubFunction.has(subFuncName)) groupedBySubFunction.set(subFuncName, []);
                         groupedBySubFunction.get(subFuncName)!.push({ area, room, instance, funcDpt: func.dpt });
                    }
                    // Generate inline feedback if needed
                    if (!useSeparateFeedbackGroup && func.isFeedback && !isPureFeedback) {
                        const subFuncName = `${func.name} RM`;
                        if (!groupedBySubFunction.has(subFuncName)) groupedBySubFunction.set(subFuncName, []);
                        groupedBySubFunction.get(subFuncName)!.push({ area, room, instance, funcDpt: func.dpt });
                    }
                }
                
                // Case 2: We are processing the (separate) feedback group for this function type
                if (useSeparateFeedbackGroup && mainGroup === instance.configSnapshot.feedbackMiddleGroup) {
                    if (func.isFeedback || isPureFeedback) {
                         const subFuncName = isPureFeedback ? func.name : `${func.name} RM`;
                         if (!groupedBySubFunction.has(subFuncName)) groupedBySubFunction.set(subFuncName, []);
                         groupedBySubFunction.get(subFuncName)!.push({ area, room, instance, funcDpt: func.dpt });
                    }
                }
            });
        });

        let middleGroupCounter = 0;
        const sortedSubFuncs = Array.from(groupedBySubFunction.keys()).sort();

        for (const subFuncName of sortedSubFuncs) {
            const middleGroup = middleGroupCounter++;
            rows.push({ level: 'middle', mainGroup, middleGroup, name: subFuncName });

            let subAddressCounter = 0;
            const items = groupedBySubFunction.get(subFuncName)!;
            items.sort((a, b) => a.area.mainGroup - b.area.mainGroup || a.room.name.localeCompare(b.room.name));

            for (const { area, room, instance, funcDpt } of items) {
                const roomIndex = area.rooms.findIndex(r => r.id === room.id);
                const instancesInRoom = room.functionInstances.filter(i => i.type === instance.type);
                const instanceIndex = instancesInRoom.findIndex(i => i.id === instance.id);
                
                const functionName = instance.configSnapshot.isScene
                    ? instance.customData?.sceneName || subFuncName
                    : subFuncName;

                const gaName = generateGaName(gaNameTemplate, {
                    area, room, roomIndex, instance, instanceIndex, functionName
                });

                const gaDescription = `(${instance.configSnapshot.description})`;

                 rows.push({
                    level: 'ga', mainGroup, middleGroup, sub: subAddressCounter++,
                    name: gaName, dpt: funcDpt, description: gaDescription
                });
            }
        }
    }
    return rows;
};

// --- 3. Gerätesicht ---
const generateDeviceViewRows = (project: Project): ExportRow[] => {
    const rows: ExportRow[] = [];
    const functionTypes = project.deviceConfig;
    const gaNameTemplate = project.viewOptions.gaNameTemplate;

    const mainGroupMapping: { [key: number]: {name: string, type: FunctionType} } = {};
    for (const type in functionTypes) {
        const config = functionTypes[type];
        mainGroupMapping[config.middleGroup] = { name: config.description, type: type };
    }

    for (const mainGroupStr of Object.keys(mainGroupMapping).sort((a,b)=>Number(a)-Number(b))) {
        const mainGroup = Number(mainGroupStr);
        const { name, type } = mainGroupMapping[mainGroup];
        rows.push({ level: 'main', mainGroup: mainGroup, name });

        for (const area of [...project.areas].sort((a,b) => a.mainGroup - b.mainGroup)) {
            const hasFunctionsOfType = area.rooms.some(room => room.functionInstances.some(inst => inst.type === type));
            if (!hasFunctionsOfType) continue;

            const middleGroup = area.mainGroup;
            rows.push({ level: 'middle', mainGroup: mainGroup, middleGroup, name: area.name });

            let subAddressCounter = 0;
            for (const room of area.rooms) {
                const instances = room.functionInstances.filter(inst => inst.type === type).sort((a, b) => a.id.localeCompare(b.id));
                if (instances.length === 0) continue;

                rows.push({
                    level: 'ga', mainGroup: mainGroup, middleGroup, sub: subAddressCounter++,
                    name: `--- ${room.name} ---`, dpt: '', description: `Trenner für ${room.name}`
                });
                
                instances.forEach((instance, instanceIndex) => {
                    if (instanceIndex > 0) {
                        rows.push({
                            level: 'ga', mainGroup: mainGroup, middleGroup, sub: subAddressCounter++,
                            name: '-', dpt: '', description: 'Trenner'
                        });
                    }

                    const { configSnapshot } = instance;
                    const roomIndex = area.rooms.findIndex(r => r.id === room.id);
                    
                    configSnapshot.functions.forEach(func => {
                        if (!func.enabled) return;

                        const isPureFeedback = func.name.includes('RM') || func.name.toLowerCase().includes('status');
                        
                        // Generate Action GA if not pure feedback
                        if (!isPureFeedback) {
                            const finalFuncName = configSnapshot.isScene ? (instance.customData?.sceneName || func.name) : func.name;
                            const gaName = generateGaName(gaNameTemplate, { area, room, roomIndex, instance, instanceIndex, functionName: finalFuncName });
                            rows.push({
                                level: 'ga', mainGroup: mainGroup, middleGroup, sub: subAddressCounter++,
                                name: gaName, dpt: func.dpt, description: `(${room.name})`
                            });
                        }
                        
                        // Generate Feedback GA if needed
                        if (func.isFeedback || isPureFeedback) {
                             const finalFuncName = isPureFeedback ? func.name : `${func.name} RM`;
                             const gaName = generateGaName(gaNameTemplate, { area, room, roomIndex, instance, instanceIndex, functionName: finalFuncName });
                             rows.push({
                                level: 'ga', mainGroup: mainGroup, middleGroup, sub: subAddressCounter++,
                                name: gaName, dpt: func.dpt, description: `(${room.name})`
                            });
                        }
                    });
                });
            }
        }
    }
    return rows;
};

// --- Haupt-Export-Funktion ---
export const generateExportRows = (project: Project): ExportRow[] => {
    const mode = project.viewOptions.gaStructureMode ?? 'building';
    let baseRows: ExportRow[];

    switch(mode) {
        case 'function':
            baseRows = generateFunctionViewRows(project);
            break;
        case 'device':
            baseRows = generateDeviceViewRows(project);
            break;
        case 'building':
        default:
            baseRows = generateBuildingViewRows(project);
            break;
    }

    // The automatic creation of central functions has been removed at the user's request.
    // The user can create these manually by creating an "Area" with main group 9.
    return baseRows;
};
