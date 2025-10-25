import React, { useState } from 'react';
import { Project, AiSettings } from '../../../../domain';

interface AiSettingsEditorProps {
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const SettingToggle: React.FC<{
    settingKey: keyof AiSettings;
    label: string;
    description: string;
    aiSettings: AiSettings;
    onChange: (field: keyof AiSettings, value: any) => void;
}> = ({ settingKey, label, description, aiSettings, onChange }) => (
    <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
        <div>
            <label htmlFor={`${settingKey}-toggle`} className="font-medium text-slate-300 cursor-pointer select-none">
                {label}
            </label>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
        <button
            id={`${settingKey}-toggle`} role="switch" aria-checked={aiSettings[settingKey] as boolean}
            onClick={() => onChange(settingKey, !aiSettings[settingKey])}
            className={`${aiSettings[settingKey] ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
        >
            <span className={`${aiSettings[settingKey] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
    </div>
);

const SettingSelect: React.FC<{
    settingKey: keyof AiSettings;
    label: string;
    description: string;
    aiSettings: AiSettings;
    onChange: (field: keyof AiSettings, value: any) => void;
    options: { value: string; label: string }[];
}> = ({ settingKey, label, description, aiSettings, onChange, options }) => (
    <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
        <div>
            <label htmlFor={`${settingKey}-select`} className="font-medium text-slate-300">
                {label}
            </label>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
        <select
            id={`${settingKey}-select`}
            value={aiSettings[settingKey] as string}
            onChange={(e) => onChange(settingKey, e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg text-sm p-2 text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500 min-w-[150px]"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const SettingSlider: React.FC<{
    settingKey: keyof AiSettings;
    label: string;
    description: string;
    aiSettings: AiSettings;
    onChange: (field: keyof AiSettings, value: any) => void;
    min: number;
    max: number;
    step?: number;
}> = ({ settingKey, label, description, aiSettings, onChange, min, max, step = 1 }) => (
    <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between">
            <div>
                <label className="font-medium text-slate-300">{label}</label>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <span className="text-lg font-bold text-sky-400">{aiSettings[settingKey]}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={aiSettings[settingKey] as number}
            onChange={(e) => onChange(settingKey, parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"
        />
    </div>
);

const SubTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
     <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md ${
            active
                ? 'bg-slate-700 text-sky-400'
                : 'text-slate-300 hover:bg-slate-700/50'
        }`}
    >
        {children}
    </button>
);


export const AiSettingsEditor: React.FC<AiSettingsEditorProps> = ({ project, setProject }) => {
    const [activeSubTab, setActiveSubTab] = useState<'general' | 'agent' | 'voice'>('general');
    
    const handleAiSettingChange = (field: keyof AiSettings, value: any) => {
        setProject(p => ({ ...p, aiSettings: { ...p.aiSettings, [field]: value } }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-lg">
                <SubTabButton active={activeSubTab === 'general'} onClick={() => setActiveSubTab('general')}>Allgemein</SubTabButton>
                <SubTabButton active={activeSubTab === 'agent'} onClick={() => setActiveSubTab('agent')}>Agent</SubTabButton>
                <SubTabButton active={activeSubTab === 'voice'} onClick={() => setActiveSubTab('voice')}>Sprachassistent</SubTabButton>
            </div>

            {activeSubTab === 'general' && (
                <section className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-sky-400 mb-2">Allgemeine KI-Funktionen</h3>
                    <p className="text-sm text-slate-400 -mt-2 mb-4">
                        Aktivieren oder deaktivieren Sie die intelligenten Helfer für die Projektplanung.
                    </p>
                    <SettingToggle
                        settingKey="enableRoomSuggestions"
                        label="Intelligente Raum-Vorschläge"
                        description="Schlägt automatisch Funktionen für neu erstellte, leere Räume basierend auf deren Namen vor."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                    <SettingToggle
                        settingKey="enableFullAnalysis"
                        label="Projekt-Analyse"
                        description="Aktiviert den 'Projekt analysieren'-Button, um das gesamte Projekt auf Konsistenz und Vollständigkeit zu prüfen."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                </section>
            )}

            {activeSubTab === 'agent' && (
                 <section className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-sky-400 mb-2">Autonomer Agent</h3>
                    <p className="text-sm text-slate-400 -mt-2 mb-4">
                        Konfigurieren Sie das Verhalten des proaktiven Agenten, der komplexe Aufgaben für Sie erledigen kann.
                    </p>
                     <SettingToggle
                        settingKey="enableAgentMode"
                        label="Agenten-Modus aktivieren"
                        description="Schaltet den Agenten-Modus im Chat-Fenster frei."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                     <SettingSelect
                        settingKey="agentModel"
                        label="KI-Modell für Agenten"
                        description="Wählen Sie das Sprachmodell für die Aufgaben des Agenten."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                        options={[
                            { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Schnell)' },
                            { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Stark)' },
                        ]}
                    />
                    <SettingSlider
                        settingKey="agentMaxSteps"
                        label="Maximale Schritte des Agenten"
                        description="Sicherheitslimit, um Endlosschleifen zu verhindern."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                        min={5}
                        max={25}
                    />
                     <SettingToggle
                        settingKey="agentAllowDeletion"
                        label="Agent darf Elemente löschen"
                        description="Erlaubt dem Agenten, Räume oder Bereiche zu entfernen. (Vorsicht!)"
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                     <SettingToggle
                        settingKey="agentAllowModification"
                        label="Agent darf Elemente hinzufügen/ändern"
                        description="Erlaubt dem Agenten, neue Elemente zu erstellen oder bestehende umzubenennen."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                </section>
            )}
            
            {activeSubTab === 'voice' && (
                 <section className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-sky-400 mb-2">Sprachassistent</h3>
                    <p className="text-sm text-slate-400 -mt-2 mb-4">
                        Passen Sie das Verhalten des sprachgesteuerten Assistenten an.
                    </p>
                     <SettingToggle
                        settingKey="enableVoiceAssistant"
                        label="Sprach-Chat aktivieren"
                        description="Aktiviert den Mikrofon-Button im Chat-Fenster."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                     <SettingSelect
                        settingKey="voiceAssistantVoice"
                        label="Stimme des Assistenten"
                        description="Wählen Sie die Stimme für die KI-Antworten."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                        options={[
                            { value: 'Zephyr', label: 'Zephyr (Männlich, tief)' },
                            { value: 'Puck', label: 'Puck (Männlich, freundlich)' },
                            { value: 'Charon', label: 'Charon (Männlich, ruhig)' },
                            { value: 'Kore', label: 'Kore (Weiblich, freundlich)' },
                            { value: 'Fenrir', label: 'Fenrir (Weiblich, klar)' },
                        ]}
                    />
                     <SettingToggle
                        settingKey="keepVoiceSessionAlive"
                        label="Sitzung im Hintergrund aktiv lassen"
                        description="Der Sprachassistent hört weiter zu, auch wenn das Chat-Fenster geschlossen ist."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                    <SettingSlider
                        settingKey="voiceHandOffThreshold"
                        label="Aufgaben-Übergabe ab"
                        description="Anzahl der Aktionen, ab der ein Sprachbefehl an den stärkeren Agenten übergeben wird."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                        min={1}
                        max={10}
                    />
                    <SettingToggle
                        settingKey="voiceAutoRestart"
                        label="Sprachsitzung nach Agenten-Aufgabe fortsetzen"
                        description="Startet den Sprachassistenten automatisch neu, nachdem eine Aufgabe an den Agenten übergeben wurde."
                        aiSettings={project.aiSettings}
                        onChange={handleAiSettingChange}
                    />
                </section>
            )}
        </div>
    );
};