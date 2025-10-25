import React, { useState, useEffect, useMemo } from 'react';
import { Project, AiAnalysisResult } from '../../../domain';
import { Header } from '../components/Header';
import { StructureEditor } from '../../structure-editor/components/StructureEditor';
import { ActionsPanel } from '../components/ActionsPanel';
import { PreviewPanel } from '../components/PreviewPanel';
import { Footer } from '../components/Footer';
import { SettingsPanel } from '../../settings/components/SettingsPanel';
import { AiAssistantWizard } from '../../ai-assistant/components/AiAssistantWizard';
import { loadApiKey, saveApiKey } from '../../../adapters/persistence/localStorage';
import { setApiKey as setGlobalApiKey } from '../../../shared/services/apiKeyService';
import { ProjectAnalysisModal } from '../../ai-assistant/components/ProjectAnalysisModal';
import { useProjectContext } from '../../../context/ProjectContext';
import { useToast } from '../../../context/ToastContext';
import { BulkEditPanel } from '../../bulk-edit/components';
import { GaNameTemplateEditor } from '../../structure-editor/components/GaNameTemplateEditor';

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
            <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-5 gap-6 max-w-screen-2xl mx-auto w-full min-h-0">
                <div className={`${showSidebar ? 'xl:col-span-3' : 'xl:col-span-5'} flex flex-col gap-6 min-h-0`}>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg flex-grow flex flex-col min-h-0">
                       <StructureEditor onStartWithAi={() => setIsAiWizardOpen(true)} />
                    </div>
                    {project.viewOptions.showGaNameTemplateEditor && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                            <GaNameTemplateEditor />
                        </div>
                    )}
                </div>
                {showSidebar && (
                    <aside className="xl:col-span-2 flex flex-col gap-6 min-h-0">
                       {isBulkEditing ? (
                            <BulkEditPanel />
                       ) : (
                            <>
                                {viewOptions.showActionsAndMetricsPanel && <ActionsPanel onAnalyze={() => setIsAnalysisModalOpen(true)} />}
                                {viewOptions.showPreviewPanel && <PreviewPanel />}
                            </>
                       )}
                    </aside>
                )}
            </main>
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
