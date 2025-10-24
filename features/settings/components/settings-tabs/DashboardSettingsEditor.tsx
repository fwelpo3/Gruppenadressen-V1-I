import React, { useState } from 'react';
import { Project, ViewOptions, FunctionType, GaFunction, DeviceConfig } from '../../../../domain';
import { ChevronDownIcon } from '../../../../shared/ui/icons';

interface DashboardSettingsEditorProps {
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
}

export const DashboardSettingsEditor: React.FC<DashboardSettingsEditorProps> = ({ project, setProject }) => {
    const handleViewOptionChange = (field: keyof ViewOptions, value: boolean) => {
        setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, [field]: value } }));
    };

    const SettingToggle: React.FC<{ settingKey: keyof ViewOptions; label: string; description: string }> = ({ settingKey, label, description }) => (
        <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
                <label htmlFor={`${settingKey}-toggle`} className="font-medium text-slate-300 cursor-pointer select-none">
                    {label}
                </label>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <button
                id={`${settingKey}-toggle`} role="switch" aria-checked={project.viewOptions[settingKey] as boolean}
                onClick={() => handleViewOptionChange(settingKey, !(project.viewOptions[settingKey] as boolean))}
                className={`${project.viewOptions[settingKey] ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
                <span className={`${project.viewOptions[settingKey] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
        </div>
    );

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        Object.keys(project.deviceConfig).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    const handleVisibilityChange = (type: FunctionType, isVisible: boolean) => {
        setProject(p => ({
            ...p,
            viewOptions: {
                ...p.viewOptions,
                functionTypeVisibility: {
                    ...p.viewOptions.functionTypeVisibility,
                    [type]: isVisible,
                }
            }
        }));
    };
    
    const handleSubFunctionVisibilityChange = (type: FunctionType, subFunctionName: string, isVisible: boolean) => {
        setProject(p => ({
            ...p,
            viewOptions: {
                ...p.viewOptions,
                subFunctionVisibility: {
                    ...p.viewOptions.subFunctionVisibility,
                    [type]: {
                        ...p.viewOptions.subFunctionVisibility?.[type],
                        [subFunctionName]: isVisible,
                    }
                }
            }
        }));
    };
    
    const toggleSection = (type: FunctionType) => {
        setExpandedSections(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const SubFunctionToggle: React.FC<{ type: FunctionType; func: GaFunction }> = ({ type, func }) => {
        const isSubVisible = project.viewOptions.subFunctionVisibility?.[type]?.[func.name] !== false;
        return (
            <div className="flex items-center justify-between">
                <label htmlFor={`sub-visibility-${type}-${func.name}`} className="text-sm text-slate-300 cursor-pointer select-none">
                    {func.name}
                </label>
                <button
                    id={`sub-visibility-${type}-${func.name}`} role="switch" aria-checked={isSubVisible}
                    onClick={() => handleSubFunctionVisibilityChange(type, func.name, !isSubVisible)}
                    className={`${isSubVisible ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                >
                    <span className={`${isSubVisible ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
        );
    };


    return (
        <div className="space-y-6">
            <div>
                 <h3 className="text-lg font-bold text-sky-400 mb-4">Dashboard-Ansicht</h3>
                 <p className="text-sm text-slate-400 mb-6">
                    Passen Sie an, welche Panels auf der Hauptseite sichtbar sind und welche Funktionstypen in der Raum-Bearbeitung zur Auswahl stehen.
                </p>
                <div className="space-y-4">
                    <SettingToggle
                        settingKey="showProjectSettings"
                        label="Projekteinstellungen anzeigen"
                        description="Zeigt die Felder für den Projektnamen und die Vorlagenauswahl über der Projektstruktur an."
                    />
                    <SettingToggle
                        settingKey="showActionsAndMetricsPanel"
                        label="Aktionen & Kennzahlen anzeigen"
                        description="Zeigt das Panel mit den Export-Buttons und den Projektstatistiken an."
                    />
                    <SettingToggle
                        settingKey="showPreviewPanel"
                        label="Vorschau der Gruppenadressen anzeigen"
                        description="Zeigt das Panel mit der Live-Vorschau der generierten Gruppenadressen an."
                    />
                    <SettingToggle
                        settingKey="showGaNameTemplateEditor"
                        label="GA Namensvorlagen-Editor anzeigen"
                        description="Zeigt den Editor für die Benennung der Gruppenadressen direkt im Dashboard an."
                    />
                </div>
            </div>
             <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-sky-400 mb-4">Sichtbarkeit der Funktionen</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Deaktivieren Sie hier Funktionstypen, die Sie in diesem Projekt nicht benötigen, um die Raum-Bearbeitung zu vereinfachen.
                </p>
                <div className="space-y-4">
                    {Object.entries(project.deviceConfig).map(([key, config]) => {
                        const type = key as FunctionType;
                        const isMainVisible = project.viewOptions.functionTypeVisibility?.[type] !== false;
                        const isExpanded = !!expandedSections[type];
                        const functions = (config as DeviceConfig).functions;
                        const midPoint = Math.ceil(functions.length / 2);
                        const col1Functions = functions.slice(0, midPoint);
                        const col2Functions = functions.slice(midPoint);

                        return (
                            <div key={type} className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-200">
                                        Funktion "{(config as DeviceConfig).description}" anzeigen
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            role="switch" aria-checked={isMainVisible}
                                            onClick={() => handleVisibilityChange(type, !isMainVisible)}
                                            className={`${isMainVisible ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                                        >
                                            <span className={`${isMainVisible ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                        <button onClick={() => toggleSection(type)} className="p-1 text-slate-400 hover:text-white rounded-full">
                                            <ChevronDownIcon size={5} className={`transition-transform transform ${isExpanded ? '' : '-rotate-90'}`} />
                                        </button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-x-8">
                                        <div className="space-y-3">
                                            {col1Functions.map(func => <SubFunctionToggle key={func.name} type={type} func={func} />)}
                                        </div>
                                        <div className="space-y-3">
                                            {col2Functions.map(func => <SubFunctionToggle key={func.name} type={type} func={func} />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};