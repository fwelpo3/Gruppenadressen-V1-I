

import React, { useState, useEffect } from 'react';
import {
    CloseIcon, SettingsIcon, CopyIcon, DownloadIcon, SitemapIcon, LayoutDashboardIcon,
    SparklesIcon, KeyIcon, KeyboardIcon, FileTextIcon
} from '../../../shared/ui/icons';
import {
    DeviceConfigEditor, RoomTemplateEditor, ViewSettingsEditor, AiSettingsEditor,
    ApiKeySettingsEditor, ShortcutHelp, DashboardSettingsEditor, LoggingSettingsEditor, ProjectDataEditor
} from './settings-tabs';
import { useProjectContext } from '../../../context/ProjectContext';

type Tab = 'devices' | 'templates' | 'data' | 'view' | 'dashboard' | 'ai' | 'apiKey' | 'shortcuts' | 'logs';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onApiKeyChange: (newKey: string) => void;
    initialTab?: Tab;
}

// Sub-component for a navigation item in the side menu
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
                ? 'bg-slate-700/50 text-sky-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

// Sub-component for a group heading in the side menu
const NavGroup: React.FC<{ label: string }> = ({ label }) => (
    <h4 className="px-3 pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
    </h4>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, initialTab, apiKey, onApiKeyChange }) => {
    const { project, setProject } = useProjectContext();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'devices');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || 'devices');
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;
    
    const renderContent = () => {
        switch (activeTab) {
            case 'devices': return <DeviceConfigEditor project={project} setProject={setProject} />;
            case 'templates': return <RoomTemplateEditor project={project} setProject={setProject} />;
            case 'data': return <ProjectDataEditor />;
            case 'view': return <ViewSettingsEditor project={project} setProject={setProject} />;
            case 'dashboard': return <DashboardSettingsEditor project={project} setProject={setProject} />;
            case 'ai': return <AiSettingsEditor project={project} setProject={setProject} />;
            case 'apiKey': return <ApiKeySettingsEditor apiKey={apiKey} onApiKeyChange={onApiKeyChange} />;
            case 'shortcuts': return <ShortcutHelp />;
            case 'logs': return <LoggingSettingsEditor />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30" onClick={onClose}>
            <div
                className="fixed top-0 right-0 h-full w-full max-w-4xl bg-slate-800 shadow-2xl border-l border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-200">Einstellungen</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>

                <div className="flex flex-grow min-h-0">
                    <nav className="w-60 flex-shrink-0 bg-slate-900/50 p-4 overflow-y-auto custom-scrollbar">
                        <NavGroup label="Projekt" />
                        <NavItem icon={<SettingsIcon size={5} />} label="Geräte" isActive={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
                        <NavItem icon={<CopyIcon size={5} />} label="Vorlagen" isActive={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                        <NavItem icon={<DownloadIcon size={5} />} label="Projekt-Daten" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
                        
                        <NavGroup label="Darstellung" />
                        <NavItem icon={<SitemapIcon size={5} />} label="GA-Struktur" isActive={activeTab === 'view'} onClick={() => setActiveTab('view')} />
                        <NavItem icon={<LayoutDashboardIcon size={5} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        
                        <NavGroup label="KI-Assistent" />
                        <NavItem icon={<SparklesIcon size={5} />} label="KI-Assistent" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                        <NavItem icon={<KeyIcon size={5} />} label="API-Schlüssel" isActive={activeTab === 'apiKey'} onClick={() => setActiveTab('apiKey')} />

                        <NavGroup label="Hilfe & Info" />
                        <NavItem icon={<KeyboardIcon size={5} />} label="Shortcuts" isActive={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} />
                        <NavItem icon={<FileTextIcon size={5} />} label="Logs" isActive={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                    </nav>

                    <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};