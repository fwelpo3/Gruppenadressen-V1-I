import React from 'react';
import { Project, AiSettings } from '../../../../domain';

interface AiSettingsEditorProps {
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
}

export const AiSettingsEditor: React.FC<AiSettingsEditorProps> = ({ project, setProject }) => {
    const handleAiSettingChange = (field: keyof AiSettings, value: boolean) => {
        setProject(p => ({ ...p, aiSettings: { ...p.aiSettings, [field]: value } }));
    };

    const SettingToggle: React.FC<{ settingKey: keyof AiSettings; label: string; description: string }> = ({ settingKey, label, description }) => (
        <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
                <label htmlFor={`${settingKey}-toggle`} className="font-medium text-slate-300 cursor-pointer select-none">
                    {label}
                </label>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <button
                id={`${settingKey}-toggle`} role="switch" aria-checked={project.aiSettings[settingKey]}
                onClick={() => handleAiSettingChange(settingKey, !project.aiSettings[settingKey])}
                className={`${project.aiSettings[settingKey] ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
                <span className={`${project.aiSettings[settingKey] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-400 mb-4">KI Co-Pilot Einstellungen</h3>
            <p className="text-sm text-slate-400 mb-6">
                Aktivieren oder deaktivieren Sie die intelligenten Assistenten, die Ihnen bei der Projektplanung helfen.
            </p>
            <SettingToggle
                settingKey="enableRoomSuggestions"
                label="Intelligente Raum-Vorschläge"
                description="Schlägt automatisch Funktionen für neu erstellte, leere Räume basierend auf deren Namen vor."
            />
            <SettingToggle
                settingKey="enableTemplateLearning"
                label="Vorlagen lernen"
                description="Ermöglicht das Speichern von konfigurierten Räumen als neue, wiederverwendbare Vorlagen."
            />
            <SettingToggle
                settingKey="enableFullAnalysis"
                label="Projekt-Analyse"
                description="Aktiviert den 'Projekt analysieren'-Button, um das gesamte Projekt auf Konsistenz und Vollständigkeit zu prüfen."
            />
            <SettingToggle
                settingKey="enableConsistencyChecks"
                label="Konsistenz-Prüfer (demnächst)"
                description="Überprüft Namenskonventionen und Adress-Strukturen und weist auf Abweichungen hin."
            />
             <SettingToggle
                settingKey="enableProactiveLogic"
                label="Proaktive Logik (demnächst)"
                description="Macht Vorschläge für erweiterte Logik wie Szenen oder Zentralfunktionen basierend auf der Raumausstattung."
            />
        </div>
    );
};