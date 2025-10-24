import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project } from '../../../domain';
import { fileToBase64 } from '../../../shared/utils/files';
import { restrictedProjectSchema } from '../../ai-assistant/shared/projectSchema';

interface ChangeProposal {
    newProject: Project;
    summary: string;
}

// The AI will return a partial project, this is the type for the raw response.
interface ChatResponsePayload {
    changeProposal: { newProject: Pick<Project, 'name' | 'areas'>, summary: string } | null;
    answer: string | null;
}

// This is the final, processed response type the hook returns.
interface ProcessedChatResponse {
    changeProposal: ChangeProposal | null;
    answer: string | null;
}

// --- Schemas to define the AI's capabilities ---
const changeProposalSchema = {
    type: Type.OBJECT,
    properties: {
        newProject: restrictedProjectSchema,
        summary: { type: Type.STRING, description: "Eine kurze Zusammenfassung der durchgeführten Änderungen." }
    },
    required: ['newProject', 'summary']
};

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        changeProposal: { ...changeProposalSchema, nullable: true },
        answer: { type: Type.STRING, description: "Eine textliche Antwort auf die Frage des Benutzers, falls keine Änderungen vorgenommen wurden.", nullable: true }
    },
};

const chatSystemInstruction = `Du bist ein konversationeller KNX-Projektassistent. Du erhältst eine KNX-Projektstruktur als JSON-Objekt und einen Benutzerbefehl. Manchmal erhältst du auch Dateien (z.B. Bilder, PDFs, Textdateien) als Kontext.
Deine Aufgabe ist es, entweder **die Projektstruktur** basierend auf dem Befehl und dem Kontext der Dateien zu ändern oder **eine Frage** zum Projekt/den Dateien zu beantworten.

1.  **Wenn der Befehl eine Anweisung zur Änderung des Projekts ist** (z.B. 'füge einen Raum hinzu', 'benenne Bereich um', 'füge Heizung zu allen Schlafzimmern hinzu', 'erstelle Räume basierend auf dem Grundriss in der Datei'):
    - Berücksichtige den Inhalt der bereitgestellten Dateien bei der Umsetzung der Änderung.
    - Modifiziere das bereitgestellte Projekt-JSON, um die Anfrage zu erfüllen. Mache so wenige Änderungen wie möglich. Behalte alle vorhandenen IDs bei. Erstelle neue IDs für neue Elemente (z.B. Räume, Instanzen).
    - Erstelle eine prägnante, benutzerfreundliche Zusammenfassung der von dir vorgenommenen Änderungen.
    - Antworte mit einem JSON-Objekt, bei dem 'changeProposal' das 'newProject'-Objekt (das nur 'name' und 'areas' enthält) und die 'summary' enthält und 'answer' 'null' ist.

2.  **Wenn der Befehl eine Frage ist** (z.B. 'wie viele Räume sind im Keller?', 'was steht in diesem Dokument?', 'welche Räume haben keine Jalousien?'):
    - Analysiere das Projekt-JSON und den Inhalt der Dateien, um die Antwort zu finden.
    - Formuliere eine klare, natürlichsprachliche Antwort.
    - Antworte mit einem JSON-Objekt, bei dem 'changeProposal' 'null' ist und 'answer' deine Textantwort enthält.

3.  **Wenn der Befehl unklar ist oder du mehr Informationen benötigst**:
    - Stelle eine klärende Frage.
    - Antworte mit einem JSON-Objekt, bei dem 'changeProposal' 'null' ist und 'answer' deine klärende Frage enthält.

**Wichtige Verhaltensregeln:**
- **Fokus auf Projektstruktur:** Du darfst NUR den Projektnamen ('name') und die Projektstruktur ('areas': Bereiche, Räume, Funktionen) ändern. Du darfst KEINESFALLS andere App-Einstellungen wie Gerätekonfigurationen ('deviceConfig'), Ansichtsoptionen ('viewOptions') oder KI-Einstellungen ('aiSettings') modifizieren. Das zurückgegebene 'newProject'-Objekt darf nur die Felder 'name' und 'areas' enthalten.
- **Sei proaktiv:** Wenn ein Befehl vage ist (z.B. "füge ein Büro hinzu"), treffe sinnvolle Annahmen (z.B. erstelle es im letzten Bereich, gib ihm einen Standardnamen, füge typische Büro-Funktionen wie Licht und Jalousien hinzu), anstatt nachzufragen. Erwähne deine Annahmen in der Zusammenfassung.
- **Vermeide klärende Fragen:** Frage nur dann nach, wenn ein Befehl völlig unverständlich ist. Es ist besser, eine vernünftige Annahme zu treffen, die der Benutzer leicht rückgängig machen kann, als den Arbeitsfluss zu unterbrechen.
- **Kontext nutzen:** Beziehe den gesamten Projektkontext mit ein. Wenn der Benutzer "füge Heizung zu den Schlafzimmern hinzu" sagt, identifiziere alle Räume, die als Schlafzimmer gelten könnten (z.B. "Schlafen", "Kind 1", "Eltern"), und wende die Änderung auf alle an.

**Deine Antwort MUSS immer ein JSON-Objekt sein, das dem vorgegebenen Schema entspricht.** Antworte niemals mit reinem Text.`;


const agentThinkSchema = {
    type: Type.OBJECT,
    properties: {
        thought: { type: Type.STRING, description: "Eine kurze Beschreibung deines Gedankengangs. Was hast du analysiert und warum hast du dich für den nächsten Schritt entschieden?" },
        command: { type: Type.STRING, description: "Der nächste konkrete, einzelne Befehl, den du ausführen wirst, um dem Ziel näher zu kommen." },
        isFinished: { type: Type.BOOLEAN, description: "Setze dies auf 'true' NUR, wenn du der Meinung bist, dass das Projekt jetzt vollständig ist und das ursprüngliche Ziel des Benutzers erreicht wurde." },
    },
    required: ['thought', 'command', 'isFinished'],
};

const agentSystemInstruction = `Du bist ein autonomer KNX-Planungsagent. Dein Ziel ist es, eine übergeordnete Benutzeranforderung zu nehmen und iterativ ein vollständiges und qualitativ hochwertiges KNX-Projekt zu erstellen. Du arbeitest in einer Schleife. In jeder Iteration erhältst du das aktuelle Projekt-JSON (nur Projektname und Bereiche/Räume/Funktionen) und das ursprüngliche Ziel des Benutzers.
Deine Aufgaben in jeder Schleife sind:
1.  **Denken:** Analysiere den aktuellen Projektstand im Verhältnis zum Ziel. Entscheide über den nächsten, einzelnen, konkreten Schritt. Formuliere einen kurzen Gedankenprozess und den genauen Befehl, den du als Nächstes ausführen wirst. Dein Befehl darf sich nur auf die Manipulation von Projektname, Bereichen, Räumen und deren Funktionen beziehen.
2.  **Handeln:** (Wird extern ausgeführt) Du wirst dann gebeten, diesen Befehl auszuführen, was zu einem aktualisierten Projekt-JSON führt.

- **Sei methodisch:** Gehe Schritt für Schritt vor. Erstelle zuerst Bereiche, dann Räume, dann füge Funktionen hinzu, dann überprüfe und verfeinere.
- **Sei proaktiv:** Triff sinnvolle Annahmen. Wenn ein Benutzer "ein Haus" sagt, erstelle typische Bereiche wie EG, OG, Keller.
- **Abschluss:** Wenn du glaubst, dass das Projekt alle Aspekte des ursprünglichen Ziels erfüllt, setze 'isFinished' auf 'true'.

Deine Antwort MUSS IMMER ein JSON-Objekt sein, das dem 'agentThinkSchema' entspricht.`;


export const useAiChat = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitQuery = useCallback(async (project: Project, query: string, files: File[]): Promise<ProcessedChatResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!process.env.API_KEY) throw new Error("API-Schlüssel ist nicht konfiguriert.");
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // The AI gets the full project for context, but the schema will restrict its output.
            const projectForApi = JSON.parse(JSON.stringify(project));
            
            const textPrompt = `Hier ist das aktuelle Projekt:\n${JSON.stringify(projectForApi, null, 2)}\n\nBefehl des Benutzers: "${query}"`;
            
            const parts: any[] = [];
            for (const file of files) {
                const base64Data = await fileToBase64(file);
                parts.push({
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data,
                    },
                });
            }
            parts.push({ text: textPrompt });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: {
                    systemInstruction: chatSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: chatResponseSchema,
                },
            });

            const jsonString = response.text.trim();
            const parsedJson: ChatResponsePayload = JSON.parse(jsonString);
            
            if (parsedJson.changeProposal?.newProject) {
                // The AI returns a partial project. We merge it with the existing one
                // to create a full, valid project object, preserving all settings.
                const partialProject = parsedJson.changeProposal.newProject;
                
                const fullNewProject: Project = {
                    ...project, // Start with the old project to keep all settings
                    name: partialProject.name, // Overwrite name from AI
                    areas: partialProject.areas, // Overwrite areas from AI
                };

                // Return the full, safe project object.
                return {
                    answer: null,
                    changeProposal: {
                        summary: parsedJson.changeProposal.summary,
                        newProject: fullNewProject,
                    }
                };
            }
            
            // If there were no changes, just return the text answer.
            return {
                changeProposal: null,
                answer: parsedJson.answer,
            };

        } catch (e: any) {
            console.error("Error submitting chat query:", e);
            setError(`Fehler bei der Verarbeitung Ihrer Anfrage: ${e.message || 'Bitte versuchen Sie es erneut.'}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getNextAgentStep = useCallback(async (project: Project, goal: string): Promise<{ thought: string; command: string; isFinished: boolean; } | null> => {
        setIsLoading(true);
        setError(null);
        try {
            if (!process.env.API_KEY) throw new Error("API-Schlüssel ist nicht konfiguriert.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Only pass the structural part of the project to the agent's thinking process.
            const projectForAgent = {
                name: project.name,
                areas: project.areas,
            };
            const prompt = `Hier ist das Originalziel: "${goal}"\n\nUnd hier ist das aktuelle Projekt:\n${JSON.stringify(projectForAgent, null, 2)}\n\nWas ist der nächste logische Schritt, um das Ziel zu erreichen?`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: agentSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: agentThinkSchema,
                },
            });
            return JSON.parse(response.text.trim());
        } catch (e: any) {
            console.error("Error in agent thinking process:", e);
            setError(`Fehler im Denkprozess des Agenten: ${e.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, submitQuery, getNextAgentStep };
};