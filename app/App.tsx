
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, AiAnalysisResult } from '../domain';
import { Header } from '../features/dashboard/components/Header';
import { StructureEditor } from '../features/structure-editor/components/StructureEditor';
import { ActionsPanel } from '../features/dashboard/components/ActionsPanel';
import { PreviewPanel } from '../features/dashboard/components/PreviewPanel';
import { Footer } from '../features/dashboard/components/Footer';
import { SettingsPanel } from '../features/settings/components/SettingsPanel';
import { AiAssistantWizard } from '../features/ai-assistant/components/AiAssistantWizard';
import { loadApiKey, saveApiKey } from '../adapters/persistence/localStorage';
import { setApiKey as setGlobalApiKey } from '../shared/services/apiKeyService';
import { ProjectAnalysisModal } from '../features/ai-assistant/components/ProjectAnalysisModal';
import { ProjectProvider, useProjectContext } from '../context/ProjectContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { BulkEditPanel } from '../features/bulk-edit/components';
import { ChatButton, ChatPanel } from '../features/ai-chat/components';
import { LoggingProvider } from '../context/LoggingContext';
import { useAiChat } from '../features/ai-chat/hooks/useAiChat';
import { Message } from '../features/ai-chat/components/ChatMessage';
import { GaNameTemplateEditor } from '../features/structure-editor/components/GaNameTemplateEditor';


// --- Haupt-App-Komponente (UI) ---
const AppContent: React.FC = () => {
    const { showToast } = useToast();
    const {
        project,
        setProject,
        handleApplyAiSuggestion,
        handleDownloadCsv,
        handleResetProject,
        handleAddArea,
        selectedRoomIds,
        setSelectedRoomIds,
        handleUndo,
        handleRedo,
    } = useProjectContext();
    
    const [settingsTab, setSettingsTab] = useState<any>('devices');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string>(loadApiKey());
    const [isCtrlMPressed, setIsCtrlMPressed] = useState(false);
    const ctrlMTimeoutRef = useRef<number | null>(null);
    const [cachedAnalysis, setCachedAnalysis] = useState<{ result: AiAnalysisResult; projectJSON: string; } | null>(null);

    // --- AI Chat State Lifted Here ---
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', text: "Hallo! Ich bin Ihr KI-Projektassistent. Sagen Sie mir, was ich tun soll (z.B. 'Erstelle einen Raum \"Büro\" im EG') oder aktivieren Sie den Agenten-Modus für komplexe Aufgaben.", sender: 'ai' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatFiles, setChatFiles] = useState<File[]>([]);
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const { isLoading: isAiChatLoading, error: aiChatError, submitQuery, getNextAgentStep } = useAiChat();
    const agentStopRef = useRef(false);

    const allRoomIds = useMemo(() => project.areas.flatMap(a => a.rooms.map(r => r.id)), [project.areas]);

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
        // Invalidate the cache since the project has changed.
        setCachedAnalysis(null);
    };

    const handleApplyChatChange = (newProject: Project) => {
        setProject(newProject);
        // We keep the chat open for follow-up commands.
        showToast("Änderung durch Chat-Befehl übernommen!");
        // Invalidate the cache since the project has changed.
        setCachedAnalysis(null);
    };

    // --- AI Chat Logic Lifted Here ---
    useEffect(() => {
        if(aiChatError) {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: aiChatError, sender: 'ai' }]);
            stopAgent();
        }
    }, [aiChatError]);

    const stopAgent = () => {
        if(agentStopRef.current === false) {
            agentStopRef.current = true;
            setIsAgentRunning(false);
            setMessages(prev => [...prev, { id: 'stopped', text: 'Agent wurde vom Benutzer gestoppt.', sender: 'ai' }]);
        }
    };
    
    const runAgent = async (initialGoal: string, initialFiles: File[]) => {
        agentStopRef.current = false;
        setIsAgentRunning(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `**Agent gestartet mit Ziel:** ${initialGoal}`, sender: 'user' }]);
        setChatInput('');
        setChatFiles([]);

        let currentProject = project;
        let loopCount = 0;
        const maxLoops = 15; // Safety break

        while (!agentStopRef.current && loopCount < maxLoops) {
            const stepId = `step-${loopCount}`;
            setMessages(prev => [...prev, { id: stepId, text: 'Agent denkt nach...', sender: 'ai', isLoading: true }]);
            
            const nextStep = await getNextAgentStep(currentProject, initialGoal);
            
            if (agentStopRef.current || !nextStep) {
                setMessages(prev => prev.map(m => m.id === stepId ? {...m, text: 'Agent konnte nächsten Schritt nicht ermitteln oder wurde gestoppt.', isLoading: false} : m));
                break;
            }
            
            const result = await submitQuery(currentProject, nextStep.command, loopCount === 0 ? initialFiles : []);
            
            if (agentStopRef.current) break;

            let resultSummary = "Keine Änderung vorgenommen.";
            if (result?.changeProposal) {
                currentProject = result.changeProposal.newProject;
                handleApplyChatChange(result.changeProposal.newProject); // Apply change to global state
                resultSummary = result.changeProposal.summary;
            } else if (result?.answer) {
                 resultSummary = result.answer;
            }

            const finalStepText = `**Gedanke:** ${nextStep.thought}\n\n**Aktion:** ${nextStep.command}\n\n**Ergebnis:** ${resultSummary}`;
            setMessages(prev => prev.map(m => m.id === stepId ? {...m, text: finalStepText, isLoading: false} : m));

            if (nextStep.isFinished) {
                setMessages(prev => [...prev, { id: 'finished', text: 'Agent hat seine Aufgabe abgeschlossen.', sender: 'ai' }]);
                break;
            }
            
            loopCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (loopCount >= maxLoops) {
            setMessages(prev => [...prev, { id: 'max-loops', text: 'Agent hat die maximale Anzahl an Schritten erreicht und wurde gestoppt.', sender: 'ai' }]);
        }

        setIsAgentRunning(false);
        agentStopRef.current = false;
    };
    
    const handleNormalSubmit = async () => {
        const userMessageText = chatInput;
        const currentFiles = [...chatFiles];
        setChatInput('');
        setChatFiles([]);

        setMessages(prev => [...prev, { id: Date.now().toString(), text: userMessageText, sender: 'user' }]);
        const loadingId = `${Date.now()}-loading`;
        setMessages(prev => [...prev, { id: loadingId, text: '', sender: 'ai', isLoading: true }]);

        const result = await submitQuery(project, userMessageText, currentFiles);

        if (result) {
            let aiResponseText = '';
            if (result.changeProposal) {
                handleApplyChatChange(result.changeProposal.newProject);
                aiResponseText = result.changeProposal.summary;
            } else if (result.answer) {
                aiResponseText = result.answer;
            }
            setMessages(prev => prev.map(m => m.id === loadingId ? {...m, text: aiResponseText, isLoading: false} : m));
        } else {
            setMessages(prev => prev.map(m => m.id === loadingId ? {...m, text: "Entschuldigung, da ist etwas schief gelaufen.", isLoading: false} : m));
        }
    };


    useEffect(() => {
        const isInputFocused = (target: HTMLElement) => {
            return target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.closest('[role="dialog"]');
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isChatOpen) { e.preventDefault(); setIsChatOpen(false); }
                else if (selectedRoomIds.length > 0) {
                    e.preventDefault();
                    setSelectedRoomIds([]);
                    showToast("Auswahl aufgehoben.");
                }
            }

            const modifier = e.ctrlKey || e.metaKey;

            if (isCtrlMPressed) {
                e.preventDefault(); 
                switch (e.key.toLowerCase()) {
                    case 'm':
                        setProject(p => ({ ...p, areas: p.areas.map(area => ({ ...area, isExpanded: true, rooms: area.rooms.map(room => ({ ...room, isExpanded: true })) })) }));
                        showToast("Alle Bereiche und Räume ausgeklappt.");
                        break;
                    case 'l':
                        setProject(p => ({ ...p, areas: p.areas.map(area => ({ ...area, isExpanded: false, rooms: area.rooms.map(room => ({ ...room, isExpanded: false })) })) }));
                        showToast("Alle Bereiche und Räume eingeklappt.");
                        break;
                    case 'o':
                         setProject(p => ({ ...p, areas: p.areas.map(area => ({ ...area, isExpanded: true, rooms: area.rooms.map(room => ({ ...room, isExpanded: false })) })) }));
                        showToast("Alle Räume eingeklappt.");
                        break;
                    default: break;
                }
                if (ctrlMTimeoutRef.current) {
                    clearTimeout(ctrlMTimeoutRef.current);
                    ctrlMTimeoutRef.current = null;
                }
                setIsCtrlMPressed(false);
                return;
            }

            if (e.key === '?' && !modifier && !e.shiftKey && !e.altKey) {
                if(isInputFocused(e.target as HTMLElement)) return;
                e.preventDefault();
                setSettingsTab('shortcuts');
                setIsSettingsOpen(true);
            }

            if (!modifier) return;

            switch (e.key.toLowerCase()) {
                 case 'z':
                    if (!isInputFocused(e.target as HTMLElement)) {
                        e.preventDefault();
                        handleUndo();
                    }
                    break;
                case 'y':
                    if (!isInputFocused(e.target as HTMLElement)) {
                        e.preventDefault();
                        handleRedo();
                    }
                    break;
                case 'a':
                    if (!isInputFocused(e.target as HTMLElement)) {
                        e.preventDefault();
                        if (selectedRoomIds.length > 0 && selectedRoomIds.length === allRoomIds.length) {
                            setSelectedRoomIds([]);
                            showToast("Auswahl aufgehoben.");
                        } else {
                            setSelectedRoomIds(allRoomIds);
                            showToast(`${allRoomIds.length} Räume ausgewählt.`);
                        }
                    }
                    break;
                case 'e':
                    if (!isInputFocused(e.target as HTMLElement)) {
                      e.preventDefault();
                      setIsChatOpen(p => !p);
                    }
                    break;
                case 'g': e.preventDefault(); if (project.areas.length > 0) handleDownloadCsv(); break;
                case 's': e.preventDefault(); if (e.altKey) { setIsSettingsOpen(p => !p); } else { showToast("Projekt automatisch gespeichert!"); } break;
                case 'r': if (e.shiftKey) { e.preventDefault(); handleResetProject(); } break;
                case 'b': e.preventDefault(); handleAddArea(); break;
                case 'k': e.preventDefault(); setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, compactMode: !p.viewOptions.compactMode } })); break;
                case 'm':
                    if(isInputFocused(e.target as HTMLElement)) return;
                    if (!e.altKey && !e.shiftKey) {
                        e.preventDefault();
                        setIsCtrlMPressed(true);
                        showToast("Struktur-Falten: Drücke M (auf), L (zu) oder O (Räume zu)");
                        if (ctrlMTimeoutRef.current) clearTimeout(ctrlMTimeoutRef.current);
                        ctrlMTimeoutRef.current = window.setTimeout(() => setIsCtrlMPressed(false), 3000);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [project, setProject, handleDownloadCsv, handleResetProject, handleAddArea, setIsSettingsOpen, showToast, isCtrlMPressed, allRoomIds, selectedRoomIds, setSelectedRoomIds, isChatOpen, handleUndo, handleRedo]);
    
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
                onClose={() => { setIsSettingsOpen(false); setSettingsTab('devices'); }}
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
            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={messages}
                setMessages={setMessages}
                input={chatInput}
                setInput={setChatInput}
                files={chatFiles}
                setFiles={setChatFiles}
                isAgentRunning={isAgentRunning}
                isLoading={isAiChatLoading}
                runAgent={runAgent}
                stopAgent={stopAgent}
                handleNormalSubmit={handleNormalSubmit}
            />
            <ChatButton 
                onClick={() => setIsChatOpen(p => !p)} 
                isAgentRunning={isAgentRunning && !isChatOpen} 
            />
        </div>
    );
};


// --- Provider-Wrapper ---
const App: React.FC = () => {
    return (
        <ToastProvider>
            <LoggingProvider>
                <ProjectProvider>
                    <AppContent />
                </ProjectProvider>
            </LoggingProvider>
        </ToastProvider>
    );
};

export default App;
