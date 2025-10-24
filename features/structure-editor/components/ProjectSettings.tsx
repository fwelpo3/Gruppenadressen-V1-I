import React from 'react';
import { PROJECT_TEMPLATES } from '../../../adapters/templates/roomTemplates';
import { useProjectContext } from '../../../context/ProjectContext';

export const ProjectSettings: React.FC = () => {
    const { project, handleProjectChange, handleTemplateChange } = useProjectContext();

    return (
        <div className="p-4 border-b border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-slate-400 mb-1">
                        Projektname
                    </label>
                    <input
                        type="text"
                        id="projectName"
                        value={project.name}
                        onChange={(e) => handleProjectChange('name', e.target.value)}
                        placeholder="z.b. EFH Muller"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div>
                    <label htmlFor="templateSelect" className="block text-sm font-medium text-slate-400 mb-1">
                        Vorlage verwenden
                    </label>
                    <select
                        id="templateSelect"
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        value="" // Control the value to reset it after selection
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="" disabled>Vorlage auswählen...</option>
                        {Object.entries(PROJECT_TEMPLATES).map(([key, template]) => (
                            <option key={key} value={key}>{template.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};