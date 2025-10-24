import { ProjectDeviceConfig } from '../../domain';

// Standard-Konfiguration für alle Gerätetypen.
// Jede Funktion hat jetzt ein 'enabled'-Flag für die granulare Steuerung in den Einstellungen.
export const DEFAULT_DEVICE_CONFIG: ProjectDeviceConfig = {
    light: {
        label: "L/LD",
        description: "Licht",
        middleGroup: 0,
        feedbackMiddleGroup: 6,
        functions: [
            { name: "Schalten", dpt: "1.001", offset: 0, enabled: true },
            { name: "Dimmen Relativ", dpt: "3.007", offset: 1, enabled: true },
            { name: "Wert", dpt: "5.001", offset: 2, enabled: true },
        ],
    },
    blinds: {
        label: "J",
        description: "Jalousie",
        middleGroup: 1,
        feedbackMiddleGroup: 7,
        functions: [
            { name: "Auf/Ab", dpt: "1.008", offset: 0, enabled: true },
            { name: "Stopp", dpt: "1.007", offset: 1, enabled: true },
            { name: "Position Höhe", dpt: "5.001", offset: 2, enabled: true },
            { name: "Position Lamelle", dpt: "5.001", offset: 3, enabled: true },
        ],
    },
    heating: {
        label: "H",
        description: "Heizung/Klima",
        middleGroup: 2,
        feedbackMiddleGroup: 2, // HKL hat RM typischerweise inline
        functions: [
            { name: "Stellgrösse", dpt: "5.001", offset: 0, enabled: true },
            { name: "Ist-Temperatur", dpt: "9.001", offset: 1, enabled: true },
            { name: "Basis-Sollwert", dpt: "9.001", offset: 2, enabled: true },
            { name: "Sollwert Aktuell RM", dpt: "9.001", offset: 3, isFeedback: true, enabled: true },
            { name: "Betriebsart Umschaltung", dpt: "20.102", offset: 4, enabled: true },
            { name: "Betriebsart Status RM", dpt: "20.102", offset: 5, isFeedback: true, enabled: true },
        ],
    },
    scene: {
        label: "S",
        description: "Szene",
        middleGroup: 3,
        feedbackMiddleGroup: 3,
        isScene: true,
        functions: [
            { name: "Abruf", dpt: "18.001", offset: 0, enabled: true },
        ],
    }
};