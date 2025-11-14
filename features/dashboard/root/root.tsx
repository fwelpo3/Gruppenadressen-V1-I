import React, { useState, useEffect, useMemo } from 'react';
import { Project, AiAnalysisResult } from '../../../domain';
import { Header } from './Header';
import { Footer } from './Footer';
import { SettingsPanel } from '../../settings/components/SettingsPanel';
import { AiAssistantWizard } from '../../ai-assistant/components/AiAssistantWizard';
import { loadApiKey, saveApiKey } from '../../../adapters/persistence/localStorage';
import { setApiKey as setGlobalApiKey } from '../../../shared/services/apiKeyService';
import { ProjectAnalysisModal } from '../../ai-assistant/components/ProjectAnalysisModal';
import { useProjectContext } from '../../../context/ProjectContext';
import { useToast } from '../../../context/ToastContext';
import { MainDashboardView } from '../pages/MainDashboardView';

interface DashboardPageProps {
    isSettingsOpen: boolean;
    setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    settingsTab: any;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ isSettingsOpen, setIsSettingsOpen, settingsTab }) => {
    const { showToast } = useToast();
    const {
        project,
        setProject,
        handleApplyAiSuggestion,
        selectedRoomIds,
    } = useProjectContext();

    // State for modals and panels specific to the dashboard
    const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string>(loadApiKey());
    const [cachedAnalysis, setCachedAnalysis] = useState<{ result: AiAnalysisResult; projectJSON: string; } | null>(null);

    // Make the API key available to all AI hooks via a dedicated service.
    useEffect(() => {
        setGlobalApiKey(apiKey);
    }, [apiKey]);

    const handleApiKeyChange = (newKey: string) => {
        setApiKey(newKey);
        saveApiKey(newKey);
        showToast("API-Schlüssel gespeichert!");
    };

    const handleApplyAiChange = (newProject: Project) => {
        setProject(newProject);
        setIsAnalysisModalOpen(false);
        showToast("Änderung wurde erfolgreich übernommen!");
        setCachedAnalysis(null);
    };

    const { viewOptions } = project;
    const isBulkEditing = selectedRoomIds.length > 0;
    const isDefaultSidebarVisible = viewOptions.showActionsAndMetricsPanel || viewOptions.showPreviewPanel;
    const showSidebar = isBulkEditing || isDefaultSidebarVisible;

    return (
        <div className={`h-screen bg-slate-900 flex flex-col ${project.viewOptions.compactMode ? 'compact-mode' : ''}`}>
            <Header onToggleSettings={() => setIsSettingsOpen(p => !p)} />
            <MainDashboardView/>
            <Footer />
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                initialTab={settingsTab}
                apiKey={apiKey}
                onApiKeyChange={handleApiKeyChange}
            />
            <AiAssistantWizard
                isOpen={isAiWizardOpen}
                onClose={() => setIsAiWizardOpen(false)}
                onApply={(suggestion) => {
                    handleApplyAiSuggestion(suggestion);
                    setIsAiWizardOpen(false);
                }}
            />
            <ProjectAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                onApplyChange={handleApplyAiChange}
                cachedAnalysis={cachedAnalysis}
                onAnalysisComplete={(result, projectJSON) => {
                    setCachedAnalysis({ result, projectJSON });
                }}
            />
        </div>
    );
};
