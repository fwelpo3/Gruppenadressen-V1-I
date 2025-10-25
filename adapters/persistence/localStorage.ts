import { Project, FunctionType, ViewOptions, AiSettings, Area, Room, FunctionInstance, GaFunction, DeviceConfig } from '../../domain';
import { DEFAULT_DEVICE_CONFIG } from '../config/deviceConfig';

const STORAGE_KEY = 'knx-project-data-v3';
const API_KEY_STORAGE_KEY = 'knx-gemini-api-key';

export const getInitialProject = (): Project => ({
    name: '',
    areas: [],
    settings: {},
    deviceConfig: JSON.parse(JSON.stringify(DEFAULT_DEVICE_CONFIG)),
    roomTemplates: [],
    areaTemplates: [],
    viewOptions: { 
        compactMode: false, 
        expandNewItems: true,
        duplicateRoomsOnAdd: true,
        gaStructureMode: 'building',
        gaNameTemplate: '{area.abbr} {room.name} {device.desc} {instance.index} - {function.name}',
        functionTypeVisibility: Object.fromEntries(
             Object.keys(DEFAULT_DEVICE_CONFIG).map(key => [key, true])
        ),
        subFunctionVisibility: Object.fromEntries(
            Object.entries(DEFAULT_DEVICE_CONFIG).map(([type, config]) => [
                type,
                Object.fromEntries(config.functions.map(func => [func.name, true]))
            ])
        ) as { [key: string]: { [key: string]: boolean } },
        showActionsAndMetricsPanel: true,
        showPreviewPanel: true,
        showProjectSettings: true,
        showGaNameTemplateEditor: false,
    },
    aiSettings: {
        // General
        enableRoomSuggestions: true,
        enableFullAnalysis: true,
        // Agent
        enableAgentMode: true,
        agentModel: 'gemini-2.5-flash',
        agentMaxSteps: 10,
        agentAllowDeletion: false, // Safer default
        agentAllowModification: true,
        // Voice
        enableVoiceAssistant: true,
        voiceAssistantVoice: 'Zephyr',
        keepVoiceSessionAlive: false,
        voiceHandOffThreshold: 3,
        voiceAutoRestart: true,
    },
});

export const loadProject = (): Project => {
    try {
        const savedProject = localStorage.getItem(STORAGE_KEY);
        if (savedProject) {
            let parsed = JSON.parse(savedProject);
            const initial = getInitialProject();

            // --- MIGRATION & DEEP MERGE ---
        
            // Migriert alte globale RM-Einstellungen zu granularen Einstellungen pro Gerätetyp (falls vorhanden)
            if (parsed.settings && parsed.settings.createFeedbackGAs !== undefined) {
                delete parsed.settings.createFeedbackGAs;
                delete parsed.settings.feedbackVariant;
            }

            // Migriert alte lightSwitch/lightDim Instanzen zu neuen 'light' Instanzen
            if (parsed.areas) {
                parsed.areas.forEach((area: Area) => {
                    area.rooms.forEach((room: Room) => {
                        room.functionInstances.forEach((instance: any) => {
                            const originalType = instance.type;
                            if (originalType === 'lightSwitch' || originalType === 'lightDim') {
                                instance.type = 'light';
                                const isSwitchOnly = originalType === 'lightSwitch';
                                // Ersetze den alten Snapshot durch den neuen, Standard-Snapshot für 'light'
                                const newLightConfig = JSON.parse(JSON.stringify(initial.deviceConfig.light));
                                
                                // Wenn es nur ein Schalter war, deaktiviere Dimm-Funktionen im Snapshot
                                if (isSwitchOnly) {
                                    newLightConfig.functions.forEach((f: GaFunction) => {
                                        if (f.name.toLowerCase().includes('dimm') || f.name.toLowerCase().includes('wert')) {
                                            f.enabled = false;
                                        }
                                    });
                                }
                                instance.configSnapshot = newLightConfig;
                            }
                        });
                    });
                });
            }


            // Führt deviceConfig tief zusammen, um neue Eigenschaften aus der Standardkonfiguration hinzuzufügen
            const mergedDeviceConfig = JSON.parse(JSON.stringify(initial.deviceConfig));
            if (parsed.deviceConfig) {
                 for (const key in parsed.deviceConfig) {
                    const baseConfig = initial.deviceConfig[key] || {
                        label: '', description: '', middleGroup: 0, functions: []
                    } as DeviceConfig;
                    mergedDeviceConfig[key] = { ...baseConfig, ...parsed.deviceConfig[key] };
                 }
            }
            
            // Migration: Stellt sicher, dass die `isScene` Eigenschaft für bestehende Projekte existiert
            if (mergedDeviceConfig.scene && mergedDeviceConfig.scene.isScene === undefined) {
                mergedDeviceConfig.scene.isScene = true;
            }

            // Führt ViewOptions tief zusammen
            const mergedViewOptions = { ...initial.viewOptions, ...(parsed.viewOptions || {}) };
            if (!mergedViewOptions.functionTypeVisibility) {
                mergedViewOptions.functionTypeVisibility = initial.viewOptions.functionTypeVisibility;
            } else {
                 for (const typeKey in initial.deviceConfig) {
                     if (mergedViewOptions.functionTypeVisibility[typeKey] === undefined) {
                        mergedViewOptions.functionTypeVisibility[typeKey] = true;
                     }
                 }
            }
             if (!mergedViewOptions.subFunctionVisibility) {
                mergedViewOptions.subFunctionVisibility = initial.viewOptions.subFunctionVisibility;
            } else {
                // Stellt sicher, dass alle Sub-Funktionen aus der Default-Config existieren (falls die App geupdated wurde)
                 for (const typeKey in initial.viewOptions.subFunctionVisibility) {
                    if (!mergedViewOptions.subFunctionVisibility[typeKey]) {
                        mergedViewOptions.subFunctionVisibility[typeKey] = initial.viewOptions.subFunctionVisibility[typeKey];
                    } else {
                         mergedViewOptions.subFunctionVisibility[typeKey] = {
                            ...initial.viewOptions.subFunctionVisibility[typeKey],
                            ...mergedViewOptions.subFunctionVisibility[typeKey]
                        };
                    }
                }
            }
            // Stellt sicher, dass die neue gaStructureMode Eigenschaft vorhanden ist
            if (!mergedViewOptions.gaStructureMode) {
                mergedViewOptions.gaStructureMode = initial.viewOptions.gaStructureMode;
            }
            if (!mergedViewOptions.gaNameTemplate) {
                mergedViewOptions.gaNameTemplate = initial.viewOptions.gaNameTemplate;
            }
            if (mergedViewOptions.showGaNameTemplateEditor === undefined) {
                mergedViewOptions.showGaNameTemplateEditor = initial.viewOptions.showGaNameTemplateEditor;
            }


            return {
                ...initial,
                ...parsed,
                settings: { ...initial.settings, ...(parsed.settings || {}) },
                deviceConfig: mergedDeviceConfig,
                areaTemplates: parsed.areaTemplates || [],
                viewOptions: mergedViewOptions,
                aiSettings: { ...initial.aiSettings, ...(parsed.aiSettings || {}) },
            };
        }
    } catch (error) {
        console.error("Fehler beim Laden des Projekts:", error);
    }
    return getInitialProject();
};

// FIX: Export 'saveProject' function to resolve import error.
export const saveProject = (project: Project): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (error) {
        console.error("Fehler beim Speichern des Projekts:", error);
    }
};

export const saveApiKey = (apiKey: string): void => {
    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
        console.error("Fehler beim Speichern des API-Schlüssels:", error);
    }
};

export const loadApiKey = (): string => {
    try {
        const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        return savedKey || '';
    } catch (error) {
        console.error("Fehler beim Laden des API-Schlüssels:", error);
        return '';
    }
};