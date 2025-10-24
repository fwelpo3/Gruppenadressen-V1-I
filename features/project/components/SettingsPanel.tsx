import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../../../shared/ui/icons';
import {
    TabButton,
    DeviceConfigEditor,
    RoomTemplateEditor,
    ViewSettingsEditor,
    AiSettingsEditor,
    ApiKeySettingsEditor,
    ShortcutHelp,
    DashboardSettingsEditor
} from './settings-tabs';
import { useProjectContext } from '../../../context/ProjectContext';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onApiKeyChange: (newKey: string) => void;
    initialTab?: 'devices' | 'templates' | 'shortcuts' | 'view' | 'ai' | 'apiKey' | 'dashboard';
}

type Tab = 'devices' | 'templates' | 'shortcuts' | 'view' | 'ai' | 'apiKey' | 'dashboard';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, initialTab, apiKey, onApiKeyChange }) => {
    const { project, setProject } = useProjectContext();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'devices');

    useEffect(() => {
        if(isOpen) {
            setActiveTab(initialTab || 'devices');
        }
    }, [isOpen, initialTab]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30" onClick={onClose}>
            <div
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl border-l border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">Einstellungen</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>

                <div className="border-b border-slate-700 px-4 flex flex-wrap">
                    <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')}>Geräte</TabButton>
                    <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>Vorlagen</TabButton>
                    <TabButton active={activeTab === 'view'} onClick={() => setActiveTab('view')}>Ansicht</TabButton>
                    <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
                    <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>KI Co-Pilot</TabButton>
                    <TabButton active={activeTab === 'apiKey'} onClick={() => setActiveTab('apiKey')}>API-Schlüssel</TabButton>
                    <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')}>Shortcuts</TabButton>
                </div>

                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    {activeTab === 'devices' && <DeviceConfigEditor project={project} setProject={setProject} />}
                    {activeTab === 'templates' && <RoomTemplateEditor project={project} setProject={setProject} />}
                    {activeTab === 'view' && <ViewSettingsEditor project={project} setProject={setProject} />}
                    {activeTab === 'dashboard' && <DashboardSettingsEditor project={project} setProject={setProject} />}
                    {activeTab === 'ai' && <AiSettingsEditor project={project} setProject={setProject} />}
                    {activeTab === 'apiKey' && <ApiKeySettingsEditor apiKey={apiKey} onApiKeyChange={onApiKeyChange} />}
                    {activeTab === 'shortcuts' && <ShortcutHelp />}
                </div>
            </div>
        </div>
    );
};