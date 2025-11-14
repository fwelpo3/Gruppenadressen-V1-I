

import React, { useState } from 'react';
import { ProjectProvider } from '../context/ProjectContext';
import { ToastProvider } from '../context/ToastContext';
import { LoggingProvider } from '../context/LoggingContext';
import { DashboardPage } from '../features/dashboard/root/root';
import { AiChatController } from '../features/ai-chat/components/AiChatController';
import { useGlobalShortcuts } from '../features/keyboard-shortcuts/hooks/useGlobalShortcuts';


const AppWrapper: React.FC = () => {
    // State for components that need to be controlled globally by shortcuts
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState<any>('devices');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // The global shortcut handler hook
    useGlobalShortcuts({
        isChatOpen,
        setIsChatOpen,
        setIsSettingsOpen,
        setSettingsTab,
    });

    return (
        <>
            <DashboardPage
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                settingsTab={settingsTab}
            />
            <AiChatController
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
            />
        </>
    );
};


// --- Provider-Wrapper ---
const App: React.FC = () => {
    return (
        <ToastProvider>
            <LoggingProvider>
                <ProjectProvider>
                    <AppWrapper />
                </ProjectProvider>
            </LoggingProvider>
        </ToastProvider>
    );
};

export default App;