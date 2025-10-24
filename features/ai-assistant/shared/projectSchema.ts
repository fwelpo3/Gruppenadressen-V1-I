import { Type } from "@google/genai";

export const gaFunctionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING }, dpt: { type: Type.STRING }, offset: { type: Type.INTEGER },
        isFeedback: { type: Type.BOOLEAN }, enabled: { type: Type.BOOLEAN }
    }, required: ['name', 'dpt', 'offset', 'enabled']
};
export const deviceConfigSchema = {
    type: Type.OBJECT,
    properties: {
        label: { type: Type.STRING }, description: { type: Type.STRING }, middleGroup: { type: Type.INTEGER },
        feedbackMiddleGroup: { type: Type.INTEGER }, functions: { type: Type.ARRAY, items: gaFunctionSchema }
    }, required: ['label', 'description', 'middleGroup', 'functions']
};
export const functionInstanceSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        type: { type: Type.STRING },
        configSnapshot: deviceConfigSchema,
        customData: {
            type: Type.OBJECT,
            properties: {
                sceneName: { type: Type.STRING }
            }
        }
    },
    required: ['id', 'type', 'configSnapshot']
};
export const roomSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING }, name: { type: Type.STRING },
        functionInstances: { type: Type.ARRAY, items: functionInstanceSchema },
        isExpanded: { type: Type.BOOLEAN }
    }, required: ['id', 'name', 'functionInstances']
};
export const areaSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING }, name: { type: Type.STRING }, abbreviation: { type: Type.STRING },
        mainGroup: { type: Type.INTEGER }, rooms: { type: Type.ARRAY, items: roomSchema },
        isExpanded: { type: Type.BOOLEAN }
    }, required: ['id', 'name', 'abbreviation', 'mainGroup', 'rooms']
};

export const projectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        areas: { type: Type.ARRAY, items: areaSchema },
        deviceConfig: { type: Type.OBJECT, properties: { light: deviceConfigSchema, blinds: deviceConfigSchema, heating: deviceConfigSchema, scene: deviceConfigSchema } },
        roomTemplates: { type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                id: { type: Type.STRING }, name: { type: Type.STRING },
                functions: { type: Type.OBJECT, properties: {
                    lightSwitch: { type: Type.INTEGER }, lightDim: { type: Type.INTEGER },
                    blinds: { type: Type.INTEGER }, heating: { type: Type.INTEGER }
                }}
            }, required: ['id', 'name', 'functions']
        }},
        viewOptions: { type: Type.OBJECT, properties: {
            compactMode: { type: Type.BOOLEAN }, expandNewItems: { type: Type.BOOLEAN }, gaStructureMode: { type: Type.STRING }
        }},
        aiSettings: { type: Type.OBJECT, properties: {
            enableRoomSuggestions: { type: Type.BOOLEAN }, enableConsistencyChecks: { type: Type.BOOLEAN },
            enableProactiveLogic: { type: Type.BOOLEAN }, enableFullAnalysis: { type: Type.BOOLEAN },
            enableTemplateLearning: { type: Type.BOOLEAN }
        }}
    },
    required: ['name', 'areas', 'deviceConfig', 'roomTemplates', 'viewOptions', 'aiSettings']
};

// A restricted schema that only allows the AI to return the project name and structure.
// This prevents accidental modification of settings like deviceConfig, viewOptions, etc.
export const restrictedProjectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        areas: { type: Type.ARRAY, items: areaSchema },
    },
    required: ['name', 'areas']
};