import React from 'react';
import { SettingsIcon } from '../../../shared/ui/icons';
import { useProjectContext } from '../context/ProjectContext';

interface HeaderProps {
    onToggleSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSettings }) => {
    const { project, setProject } = useProjectContext();
    const { viewOptions } = project;

    const handleViewOptionChange = (field: keyof typeof project.viewOptions, value: any) => {
        setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, [field]: value } }));
    };

    return (
        <header className="bg-slate-800/50 border-b border-slate-700 p-4 shadow-md sticky top-0 z-20">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-sky-400">KNX GA-Generator Pro</h1>
                    <p className="text-xs text-slate-400 mt-1 hidden sm:block">Funktionsbasierte Planung nach KNX-Richtlinien</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Compact Mode Toggle */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="compact-toggle" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                            Kompakt
                        </label>
                        <button
                            id="compact-toggle" role="switch" aria-checked={viewOptions.compactMode}
                            onClick={() => handleViewOptionChange('compactMode', !viewOptions.compactMode)}
                            className={`${viewOptions.compactMode ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                        >
                            <span className={`${viewOptions.compactMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    {/* Settings Panel Toggle */}
                    <button onClick={onToggleSettings} className="p-2 text-slate-300 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full">
                        <SettingsIcon size={6} />
                    </button>
                </div>
            </div>
        </header>
    );
};
