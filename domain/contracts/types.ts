// Definiert die verfügbaren Funktionstypen. Entspricht den Schlüsseln in der Gerätekonfiguration.
export type FunctionType = string;

// --- Konfiguration und Vorlagen ---

export interface GaFunction {
  name: string;
  dpt: string;
  offset: number;
  isFeedback?: boolean;
  enabled: boolean; 
}

export interface DeviceConfig {
  label: string;
  description: string;
  middleGroup: number;
  feedbackMiddleGroup?: number;
  functions: GaFunction[];
  isScene?: boolean; // NEU: Identifiziert eine Konfiguration als Szene für spezielle Logik
}

// Die gesamte anpassbare Konfiguration für Gerätetypen
export type ProjectDeviceConfig = {
  [id: string]: DeviceConfig;
};

// NEU: Ein "Schnappschuss" der Konfiguration, wie sie beim Erstellen der Funktion war.
// Dies ist der Kern der nicht-rückwirkenden Änderungslogik.
export interface FunctionInstance {
  id: string;
  type: FunctionType;
  configSnapshot: DeviceConfig;
  customData?: {
    sceneName?: string;
  };
}

export interface Room {
  id: string;
  name: string; // z.B. "Wohnzimmer"
  // ERSETZT: `functions: RoomFunctions;`
  functionInstances: FunctionInstance[];
  isExpanded?: boolean; // NEU: Speicher den Zustand
}

export interface Area {
  id: string;
  name: string; // z.B. "Erdgeschoss"
  abbreviation: string; // z.B. "EG", wird für GA-Namen verwendet
  mainGroup: number;
  rooms: Room[];
  isExpanded?: boolean; // NEU: Speicher den Zustand
}


// Behält die alte Struktur für einfache Vorlagendefinitionen
export type RoomFunctionsTemplate = {
    [key: string]: number; // z.B. { light: 2, blinds: 1 }
};

export interface CustomRoomTemplate {
  id:string;
  name: string;
  functions?: RoomFunctionsTemplate;
}

// NEU: Typ für eine Bereichs-Vorlage
export interface CustomAreaTemplate {
  id: string;
  name: string;
  abbreviation?: string;
  rooms?: {
      name: string;
      functions: RoomFunctionsTemplate;
  }[];
}


// Globale Projekteinstellungen
export interface ProjectSettings {
  // createFeedbackGAs und feedbackVariant wurden in die DeviceConfig verschoben
}

// NEU: Definiert die Strukturierungsmodi für Gruppenadressen
export type GaStructureMode = 'building' | 'function' | 'device';


// Optionen für die Benutzeroberfläche
export interface ViewOptions {
  compactMode: boolean;
  expandNewItems: boolean; // NEU: Steuert das Standardverhalten
  duplicateRoomsOnAdd: boolean;
  gaStructureMode: GaStructureMode; // NEU: Steuert die GA-Struktur
  gaNameTemplate: string; // NEU: Vorlage für GA-Namen
  functionTypeVisibility?: { [key: string]: boolean; };
  subFunctionVisibility?: {
    [key: string]: {
        [subFunctionName: string]: boolean;
    }
  };
  showActionsAndMetricsPanel: boolean;
  showPreviewPanel: boolean;
  showProjectSettings: boolean;
  showGaNameTemplateEditor: boolean;
}

// NEU: Einstellungen für den KI Co-Pilot
export interface AiSettings {
  enableRoomSuggestions: boolean;
  enableConsistencyChecks: boolean;
  enableProactiveLogic: boolean;
  enableFullAnalysis: boolean;
  enableTemplateLearning: boolean;
}


// Das gesamte Projekt-Objekt, das im Local Storage gespeichert wird
export interface Project {
  name: string;
  areas: Area[];
  settings: ProjectSettings;
  deviceConfig: ProjectDeviceConfig;
  roomTemplates: CustomRoomTemplate[];
  areaTemplates?: CustomAreaTemplate[];
  viewOptions: ViewOptions;
  aiSettings: AiSettings;
}

// Struktur für vordefiniertes Projektvorlagen
export interface ProjectTemplate {
  name: string;
  areas: (Omit<Area, 'id' | 'rooms' | 'isExpanded'> & {
    rooms: (Omit<Room, 'id' | 'functionInstances' | 'isExpanded'> & { functions: RoomFunctionsTemplate })[];
  })[];
}

// --- Generierungs-Typen ---

export interface GroupAddress {
  address: string;
  name: string;
  dpt: string;
  description: string;
}

export type ExportRow = {
    level: 'main' | 'middle' | 'ga';
    mainGroup: number;
    middleGroup?: number;
    sub?: number;
    name: string;
    dpt?: string;
    description?: string;
}


// --- KI-Assistent Typen ---

export type AiFunctionSuggestion = RoomFunctionsTemplate;

export interface AiRoomSuggestion {
  id: string;
  name: string;
  functions: AiFunctionSuggestion;
}

export interface AiAreaSuggestion {
  id: string;
  name: string;
  abbreviation: string;
  rooms: AiRoomSuggestion[];
}

export type AiProjectSuggestion = AiAreaSuggestion[];

// NEU: Typen für die Projektanalyse
export interface AiAnalysisFinding {
  severity: 'info' | 'warning' | 'suggestion';
  title: string;
  description: string;
  context?: string; // Optional context, e.g., "Raum: Wohnzimmer"
  isActionable?: boolean; // NEU: Gibt an, ob die KI eine automatische Korrektur vorschlagen kann.
}

export interface AiAnalysisResult {
  consistency: AiAnalysisFinding[];
  completeness: AiAnalysisFinding[];
  optimizations: AiAnalysisFinding[];
}

// NEU: Typ für einen KI-Änderungsvorschlag
export interface AiChangeProposal {
  newProject: Project;
  summary: string;
}