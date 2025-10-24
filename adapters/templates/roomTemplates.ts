import { ProjectTemplate, ProjectDeviceConfig, FunctionInstance, RoomFunctionsTemplate, FunctionType, GaFunction } from '../../domain';

// Hilfsfunktion, um aus Vorlagen das neue `functionInstances`-Array zu erstellen.
// Nimmt die Zähler aus der Vorlage und erstellt Instanzen mit der aktuellen Gerätekonfiguration.
export const createFunctionInstancesForTemplate = (
    functions: RoomFunctionsTemplate,
    deviceConfig: ProjectDeviceConfig
): FunctionInstance[] => {
    const instances: FunctionInstance[] = [];
    for (const key in functions) {
        const type = key as keyof RoomFunctionsTemplate; // 'lightSwitch', 'lightDim', ...
        const count = functions[type] || 0;
        
        // NEUE LOGIK: Bildet deskriptive Typen (lightSwitch/dim) auf den kanonischen Typ ('light') ab
        const canonicalType: FunctionType | null = 
            (type === 'lightSwitch' || type === 'lightDim') ? 'light' 
            : (deviceConfig[type as FunctionType] ? type as FunctionType : null);

        if (!canonicalType) continue;

        const config = deviceConfig[canonicalType];
        if (config) {
            for (let i = 0; i < count; i++) {
                const configSnapshot = JSON.parse(JSON.stringify(config));
                
                // Wichtig: Wenn nur ein Schalter angefordert wurde, deaktiviere Dimm-Funktionen im Snapshot.
                if (type === 'lightSwitch') {
                    configSnapshot.functions.forEach((f: GaFunction) => {
                        if (f.name.toLowerCase().includes('dimm') || f.name.toLowerCase().includes('wert')) {
                            f.enabled = false;
                        }
                    });
                }

                const instance: FunctionInstance = {
                    id: `instance-${Date.now()}-${Math.random()}`,
                    type: canonicalType,
                    configSnapshot: configSnapshot,
                };

                if (canonicalType === 'scene') {
                    instance.customData = { sceneName: `Szene ${i + 1}` };
                }

                instances.push(instance);
            }
        }
    }
    return instances;
};

// Projektvorlagen, die die Zähler-Struktur beibehalten für einfache Definition.
export const PROJECT_TEMPLATES: { [key: string]: ProjectTemplate } = {
    residential: {
        name: "Einfamilienhaus Standard",
        areas: [
            { name: 'Erdgeschoss', abbreviation: 'EG', mainGroup: 1, rooms: [
                { name: 'Wohnen/Essen', functions: { lightDim: 2, lightSwitch: 1, blinds: 1, heating: 1 } },
                { name: 'Küche', functions: { lightSwitch: 1, blinds: 1 } },
                { name: 'Flur', functions: { lightSwitch: 1 } },
            ]},
            { name: 'Obergeschoss', abbreviation: 'OG', mainGroup: 2, rooms: [
                { name: 'Schlafen', functions: { lightDim: 1, blinds: 1, heating: 1 } },
                { name: 'Badezimmer', functions: { lightSwitch: 2, heating: 1 } },
                { name: 'Kind 1', functions: { lightSwitch: 1, blinds: 1, heating: 1 } },
            ]}
        ]
    },
    apartment: {
        name: "Wohnung Standard",
        areas: [
            { name: 'Wohnung', abbreviation: 'W', mainGroup: 1, rooms: [
                { name: 'Wohnen/Essen', functions: { lightDim: 1, blinds: 1, heating: 1 } },
                { name: 'Schlafen', functions: { lightSwitch: 1, blinds: 1 } },
                { name: 'Bad', functions: { lightSwitch: 1 } },
            ]}
        ]
    }
};