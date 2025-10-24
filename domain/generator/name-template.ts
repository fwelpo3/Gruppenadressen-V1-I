import { Area, Room, FunctionInstance } from '../contracts/types';

export interface GaNameTemplateData {
    area: Area;
    room: Room;
    roomIndex: number; // 0-based
    instance: FunctionInstance;
    instanceIndex: number; // 0-based
    functionName: string;
}

export const generateGaName = (template: string, data: GaNameTemplateData): string => {
    const { area, room, roomIndex, instance, instanceIndex, functionName } = data;
    const deviceConfig = instance.configSnapshot;

    const replacements: { [key: string]: (padding?: number) => string } = {
        'area.name': () => area.name,
        'area.abbr': () => area.abbreviation,
        'room.name': () => room.name,
        'room.index': (padding = 1) => String(roomIndex + 1).padStart(padding, '0'),
        'device.label': () => deviceConfig.label,
        'device.desc': () => deviceConfig.description,
        'instance.index': (padding = 1) => String(instanceIndex + 1).padStart(padding, '0'),
        'function.name': () => functionName,
    };

    let result = template;
    // Regex to find placeholders like {key} or {key:padding}
    const regex = /\{([\w.]+)(?::(\d+))?\}/g;

    result = result.replace(regex, (match, key, paddingStr) => {
        if (replacements[key]) {
            const padding = paddingStr ? parseInt(paddingStr, 10) : undefined;
            return replacements[key](padding);
        }
        return match; // return original placeholder if not found
    });

    return result.replace(/\s+/g, ' ').trim(); // Clean up multiple spaces
};
