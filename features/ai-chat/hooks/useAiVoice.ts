import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { getApiKey } from '../../../shared/services/apiKeyService';
import { createAudioBlob, decode, decodeAudioData } from '../../../shared/utils/audio';
import { Project } from '../../../domain';
import { restrictedProjectSchema } from '../../ai-assistant/shared/projectSchema';
import { Message } from '../components/ChatMessage';

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
type TranscriptionCallback = (type: 'user' | 'ai' | 'turnComplete', text: string) => void;
type ProjectUpdateCallback = (newProject: Project, summary: string) => void;
type DelegateTaskCallback = (goal: string) => void;

const chatSystemInstruction = `Du bist ein sprachgesteuerter KNX-Projektassistent. Deine Aufgabe ist es, Sprachbefehle zu verstehen und das KNX-Projekt entsprechend zu ändern oder Fragen dazu zu beantworten. Du musst natürlich und gesprächig antworten und deine Aktionen bestätigen. Du erhältst das aktuelle Projekt und den bisherigen Chatverlauf als Kontext.
**Verhaltensregeln:**
- **Fokus auf Projektstruktur:** Du darfst NUR den Projektnamen ('name') und die Projektstruktur ('areas') ändern.
- **Sei proaktiv:** Wenn ein Befehl vage ist (z.B. "füge ein Büro hinzu"), treffe sinnvolle Annahmen (z.B. erstelle es im letzten Bereich, füge typische Büro-Funktionen hinzu).
- **Kurze, prägnante Antworten:** Formuliere deine gesprochenen Antworten kurz und klar. Bestätige durchgeführte Aktionen. z.B. "Okay, ich habe den Raum 'Büro' im Erdgeschoss hinzugefügt."
- **Function Calling nutzen:** Für JEDE Änderung am Projekt musst du das 'updateProject' Tool verwenden. Für reine Fragen, antworte direkt.`;


const updateProjectFunctionDeclaration: FunctionDeclaration = {
  name: 'updateProject',
  description: "Aktualisiert, modifiziert oder fügt dem KNX-Projekt basierend auf dem Benutzerbefehl Elemente hinzu. Muss für JEDE Änderung am Projekt verwendet werden.",
  parameters: {
    type: Type.OBJECT,
    properties: {
        newProject: restrictedProjectSchema,
        summary: { type: Type.STRING, description: "Eine kurze, prägnante Zusammenfassung der durchgeführten Änderung, die als Toast-Nachricht angezeigt werden kann. z.B. 'Raum X hinzugefügt' oder 'Bereich Y umbenannt'." }
    },
    required: ['newProject', 'summary']
  },
};


export const useAiVoice = ({ 
    onTranscriptionUpdate,
    project,
    onProjectUpdate,
    voice,
    messages,
    onDelegateTask,
    voiceHandOffThreshold,
}: { 
    onTranscriptionUpdate: TranscriptionCallback,
    project: Project,
    onProjectUpdate: ProjectUpdateCallback,
    voice: string,
    messages: Message[],
    onDelegateTask: DelegateTaskCallback,
    voiceHandOffThreshold: number,
}) => {
    const [status, setStatus] = useState<VoiceStatus>('idle');
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioResourcesRef = useRef<any>({});
    const currentUserUtterance = useRef('');
    
    const cleanup = useCallback(() => {
        const resources = audioResourcesRef.current;
        if (resources.stream) {
            resources.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        if (resources.scriptProcessor) {
            resources.scriptProcessor.disconnect();
        }
        if (resources.source) {
            resources.source.disconnect();
        }
        if (resources.inputAudioContext && resources.inputAudioContext.state !== 'closed') {
            resources.inputAudioContext.close();
        }
        if (resources.outputAudioContext && resources.outputAudioContext.state !== 'closed') {
            resources.outputAudioContext.close();
        }
        for (const source of (resources.sources || [])) {
             source.stop();
        }
        audioResourcesRef.current = {};
        sessionPromiseRef.current = null;
        currentUserUtterance.current = '';
        setStatus('idle');
    }, []);

    const stopConversation = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }
        cleanup();
    }, [cleanup]);

    const startConversation = useCallback(async () => {
        if (status !== 'idle' && status !== 'error') return;

        setStatus('connecting');

        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API-Schlüssel ist nicht konfiguriert.");

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            const ai = new GoogleGenAI({ apiKey });
            
            const historyText = messages
                .filter(m => !m.isLoading && m.id !== 'initial')
                .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice as any } } },
                    systemInstruction: `${chatSystemInstruction}\n\n## Bisheriger Gesprächsverlauf:\n${historyText}\n\n## Aktueller Projekt-Kontext:\n${JSON.stringify({ name: project.name, areas: project.areas }, null, 2)}`,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{functionDeclarations: [updateProjectFunctionDeclaration]}],
                },
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createAudioBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);

                        audioResourcesRef.current = { ...audioResourcesRef.current, source, scriptProcessor };
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setStatus('speaking');
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.addEventListener('ended', () => {
                                sources.delete(source);
                                if (sources.size === 0) {
                                    setStatus('listening');
                                }
                            });
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                        
                        if (message.toolCall) {
                            if (message.toolCall.functionCalls.length >= voiceHandOffThreshold) {
                                onDelegateTask(currentUserUtterance.current);
                                return; // Stop processing here, let controller handle it.
                            }
                            
                            for (const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'updateProject' && fc.args) {
                                    // FIX: Cast fc.args to a specific type to resolve TypeScript errors about unknown properties.
                                    const { newProject: partialProject, summary } = fc.args as { newProject: Pick<Project, 'name' | 'areas'>; summary: string };
                                    
                                    const fullNewProject: Project = {
                                        ...project,
                                        name: partialProject.name,
                                        areas: partialProject.areas,
                                    };
                                    onProjectUpdate(fullNewProject, summary);

                                    sessionPromiseRef.current?.then((session) => {
                                        session.sendToolResponse({
                                            functionResponses: {
                                                id: fc.id,
                                                name: fc.name,
                                                response: { result: "ok, change applied successfully" },
                                            }
                                        });
                                    });
                                }
                            }
                        }

                        if (message.serverContent?.inputTranscription?.text) {
                            currentUserUtterance.current += message.serverContent.inputTranscription.text;
                            onTranscriptionUpdate('user', message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription?.text) {
                            onTranscriptionUpdate('ai', message.serverContent.outputTranscription.text);
                        }
                        if (message.serverContent?.turnComplete) {
                            onTranscriptionUpdate('turnComplete', '');
                            currentUserUtterance.current = '';
                        }

                        if (message.serverContent?.interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                            setStatus('listening');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus('error');
                        cleanup();
                    },
                    onclose: () => {
                        cleanup();
                    },
                },
            });

            sessionPromiseRef.current = sessionPromise;
            audioResourcesRef.current = { stream, inputAudioContext, outputAudioContext, sources };

        } catch (e: any) {
            console.error("Failed to start voice conversation:", e);
            setStatus('error');
            cleanup();
        }
    }, [status, onTranscriptionUpdate, cleanup, project, onProjectUpdate, voice, messages, onDelegateTask, voiceHandOffThreshold]);

    return { voiceStatus: status, startConversation, stopConversation };
};
