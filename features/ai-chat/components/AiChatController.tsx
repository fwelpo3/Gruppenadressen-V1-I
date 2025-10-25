import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project } from '../../../domain';
import { Message } from './ChatMessage';
import { ChatButton } from './ChatButton';
import { ChatPanel } from './ChatPanel';
import { useProjectContext } from '../../../context/ProjectContext';
import { useToast } from '../../../context/ToastContext';
import { useAiChat } from '../hooks/useAiChat';
import { useAiVoice } from '../hooks/useAiVoice';

interface AiChatControllerProps {
    isChatOpen: boolean;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AiChatController: React.FC<AiChatControllerProps> = ({ isChatOpen, setIsChatOpen }) => {
    const { project, setProject } = useProjectContext();
    const { aiSettings } = project;
    const { showToast } = useToast();

    // --- AI Chat State ---
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', text: "Hallo! Ich bin Ihr KI-Projektassistent. Sagen Sie mir, was ich tun soll (z.B. 'Erstelle einen Raum \"Büro\" im EG') oder aktivieren Sie den Agenten-Modus für komplexe Aufgaben.", sender: 'ai' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatFiles, setChatFiles] = useState<File[]>([]);
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const { isLoading: isAiChatLoading, error: aiChatError, submitQuery, getNextAgentStep } = useAiChat({
        agentModel: aiSettings.agentModel
    });
    const agentStopRef = useRef(false);

    // --- AI Voice State ---
    const currentUserTranscriptId = useRef<string | null>(null);
    const currentAiTranscriptId = useRef<string | null>(null);

    const handleApplyChatChange = (newProject: Project) => {
        setProject(newProject);
        showToast("Änderung durch KI-Assistent übernommen!");
    };

     const handleProjectUpdateFromVoice = useCallback((newProject: Project, summary: string) => {
        setProject(newProject);
        showToast(summary || "Projekt per Sprache aktualisiert!");
    }, [setProject, showToast]);
    
    const runAgentFromVoice = useCallback(async (goal: string) => {
        // This function is called by the voice hook to delegate a task.
        stopConversation();
        setIsChatOpen(true);
        setMessages(prev => [...prev, { id: 'delegating', text: `Eine komplexe Aufgabe wurde vom Sprachassistenten an den Agenten übergeben.`, sender: 'ai' }]);
        await runAgent(goal, []);
        if (project.aiSettings.voiceAutoRestart) {
            startConversation();
        }
    }, [project.aiSettings.voiceAutoRestart]);


    const handleTranscriptionUpdate = useCallback((type: 'user' | 'ai' | 'turnComplete', text: string) => {
        if (type === 'user') {
            if (!currentUserTranscriptId.current) {
                const newId = `${Date.now()}-user-transcript`;
                currentUserTranscriptId.current = newId;
                setMessages(prev => [...prev, { id: newId, text: text, sender: 'user' }]);
            } else {
                setMessages(prev => prev.map(m => m.id === currentUserTranscriptId.current ? { ...m, text: m.text + text } : m));
            }
        } else if (type === 'ai') {
             if (!currentAiTranscriptId.current) {
                const newId = `${Date.now()}-ai-transcript`;
                currentAiTranscriptId.current = newId;
                setMessages(prev => [...prev, { id: newId, text: text, sender: 'ai' }]);
            } else {
                setMessages(prev => prev.map(m => m.id === currentAiTranscriptId.current ? { ...m, text: m.text + text } : m));
            }
        } else if (type === 'turnComplete') {
             // Add the final transcriptions to the shared message history
            const finalUserMessage = messages.find(m => m.id === currentUserTranscriptId.current);
            const finalAiMessage = messages.find(m => m.id === currentAiTranscriptId.current);
            
            currentUserTranscriptId.current = null;
            currentAiTranscriptId.current = null;
        }
    }, [messages]);

    const { voiceStatus, startConversation, stopConversation } = useAiVoice({ 
        onTranscriptionUpdate: handleTranscriptionUpdate,
        project,
        onProjectUpdate: handleProjectUpdateFromVoice,
        voice: aiSettings.voiceAssistantVoice,
        messages,
        onDelegateTask: runAgentFromVoice,
        voiceHandOffThreshold: aiSettings.voiceHandOffThreshold,
    });


    // --- AI Chat Logic ---
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
        if (!aiSettings.enableAgentMode) {
            setMessages(prev => [...prev, { id: 'agent-disabled', text: 'Der Agenten-Modus ist in den Einstellungen deaktiviert.', sender: 'ai' }]);
            return;
        }

        agentStopRef.current = false;
        setIsAgentRunning(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `**Agent gestartet mit Ziel:** ${initialGoal}`, sender: 'user' }]);
        setChatInput('');
        setChatFiles([]);

        let currentProject = project;
        let loopCount = 0;
        const maxLoops = aiSettings.agentMaxSteps;

        while (!agentStopRef.current && loopCount < maxLoops) {
            const stepId = `step-${loopCount}`;
            setMessages(prev => [...prev, { id: stepId, text: 'Agent denkt nach...', sender: 'ai', isLoading: true }]);
            
            const nextStep = await getNextAgentStep(currentProject, initialGoal);
            
            if (agentStopRef.current || !nextStep) {
                setMessages(prev => prev.map(m => m.id === stepId ? {...m, text: 'Agent konnte nächsten Schritt nicht ermitteln oder wurde gestoppt.', isLoading: false} : m));
                break;
            }
            
            const result = await submitQuery(currentProject, nextStep.command, loopCount === 0 ? initialFiles : [], messages);
            
            if (agentStopRef.current) break;

            let resultSummary = "Keine Änderung vorgenommen.";
            if (result?.changeProposal) {
                currentProject = result.changeProposal.newProject;
                handleApplyChatChange(result.changeProposal.newProject);
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
            setMessages(prev => [...prev, { id: 'max-loops', text: `Agent hat die maximale Anzahl an Schritten (${maxLoops}) erreicht und wurde gestoppt.`, sender: 'ai' }]);
        }

        setIsAgentRunning(false);
        agentStopRef.current = false;
    };
    
    const handleNormalSubmit = async () => {
        const userMessageText = chatInput;
        const currentFiles = [...chatFiles];
        setChatInput('');
        setChatFiles([]);

        const newUserMessage: Message = { id: Date.now().toString(), text: userMessageText, sender: 'user' };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        const loadingId = `${Date.now()}-loading`;
        setMessages(prev => [...prev, { id: loadingId, text: '', sender: 'ai', isLoading: true }]);

        const result = await submitQuery(project, userMessageText, currentFiles, updatedMessages);

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
    
    const handleStartVoice = () => {
        if (!aiSettings.enableVoiceAssistant) {
            setMessages(prev => [...prev, { id: 'voice-disabled', text: 'Der Sprach-Assistent ist in den Einstellungen deaktiviert.', sender: 'ai' }]);
             return;
        }
        startConversation();
    }

    return (
        <>
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
                isLoading={isAiChatLoading || voiceStatus === 'connecting'}
                runAgent={runAgent}
                stopAgent={stopAgent}
                handleNormalSubmit={handleNormalSubmit}
                voiceStatus={voiceStatus}
                startVoiceSession={handleStartVoice}
                stopVoiceSession={stopConversation}
                aiSettings={aiSettings}
            />
            <ChatButton 
                onClick={() => setIsChatOpen(p => !p)} 
                isAgentRunning={isAgentRunning && !isChatOpen} 
                voiceStatus={voiceStatus}
                isChatOpen={isChatOpen}
            />
        </>
    );
};