import React, {useMemo, useState, useEffect} from 'react'

import { StructureEditor } from '../../structure-editor/components/StructureEditor';
import { ActionsPanel } from '../components/ActionsPanel';
import { PreviewPanel } from '../components/PreviewPanel';

import { BulkEditPanel } from '../../bulk-edit/components';
import { GaNameTemplateEditor } from '../../structure-editor/components/GaNameTemplateEditor';
import { useProjectContext } from '@/context/ProjectContext';

export const MainDashboardView: React.FC = () => {
    const {
        project,
        selectedRoomIds,
    } = useProjectContext();

    // State for modals and panels specific to the dashboard
    const [setIsAiWizardOpen] = useState(false);
    const [setIsAnalysisModalOpen] = useState(false);

    const { viewOptions } = project;
    const isBulkEditing = selectedRoomIds.length > 0;
    const isDefaultSidebarVisible = viewOptions.showActionsAndMetricsPanel || viewOptions.showPreviewPanel;
    const showSidebar = isBulkEditing || isDefaultSidebarVisible;

    return (
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
    )
}
