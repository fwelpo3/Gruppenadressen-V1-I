
import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project, AiAnalysisFinding, AiChangeProposal } from '../../../domain';
import { restrictedProjectSchema } from '../shared/projectSchema';
import { getApiKey } from '../../../shared/services/apiKeyService';

const fixResponseSchema = {
    type: Type.OBJECT,
    properties: {
        newProject: restrictedProjectSchema,
        summary: { type: Type.STRING, description: "Eine kurze, prägnante Zusammenfassung der durchgeführten Änderung in menschlicher Sprache."}
    },
    required: ['newProject', 'summary']
}

const fixSystemInstruction = `Du bist ein KNX-Systemintegrator-Experte. Deine Aufgabe ist es, ein Problem in einer KNX-Projektstruktur zu beheben. Du erhältst das gesamte Projekt als JSON-Objekt und einen spezifischen Problembericht.
Deine Aufgabe ist es:
1. Das Problem zu verstehen.
2. Das Projekt-JSON so zu modifizieren, dass NUR dieses spezifische Problem behoben wird. Mache so wenige Änderungen wie möglich. Behalte alle IDs bei, es sei denn, das Hinzufügen eines neuen Elements ist zur Behebung erforderlich.
3. Gib das korrigierte Projekt zurück. Deine Antwort darf **NUR** die Felder 'name' und 'areas' des Projektobjekts enthalten. Alle anderen Felder (deviceConfig, viewOptions etc.) werden ignoriert.
4. Schreibe eine kurze, prägnante Zusammenfassung deiner Änderung für den Benutzer.

Beispiel: Wenn der Problembericht "Inkonsistente Benennung: 'Wohnen/Essen' sollte zu den anderen Räumen passen." lautet, könntest du den Raumnamen in 'Wohn- und Esszimmer' ändern und als Zusammenfassung zurückgeben: "Benennt den Raum 'Wohnen/Essen' in 'Wohn- und Esszimmer' um, um eine konsistente Benennung zu gewährleisten."
Deine Antwort MUSS ein JSON-Objekt sein, das dem vorgegebenen Schema entspricht.`;


export const useAiProjectFixer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [proposal, setProposal] = useState<AiChangeProposal | null>(null);

    const proposeFix = useCallback(async (project: Project, finding: AiAnalysisFinding): Promise<AiChangeProposal | null> => {
        setIsLoading(true);
        setError(null);
        setProposal(null);

        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API-Schlüssel ist nicht konfiguriert.");

            const ai = new GoogleGenAI({ apiKey });
            
            // Create a deep copy and remove properties that cause issues with the API schema
            const projectForApi = JSON.parse(JSON.stringify(project));
            if (!projectForApi.deviceConfig.scene) {
                projectForApi.deviceConfig.scene = DEFAULT_DEVICE_CONFIG.scene;
            }

            const prompt = `Hier ist das aktuelle Projekt:\n${JSON.stringify(projectForApi, null, 2)}\n\nUnd hier ist das zu behebende Problem:\n${JSON.stringify(finding, null, 2)}\n\nBitte behebe dieses Problem und gib das neue Projekt (nur Name und Bereiche) sowie eine Zusammenfassung zurück. Wenn du eine neue 'functionInstance' hinzufügst, erstelle eine neue, zufällige ID dafür im Format 'instance-epoch-random'.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: fixSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: fixResponseSchema,
                },
            });
            
            const jsonString = response.text.trim();
            const rawParsedJson = JSON.parse(jsonString) as { newProject: { name: string, areas: any[] } | null; summary: string };

            if (rawParsedJson.newProject) {
                const partialProject = rawParsedJson.newProject;

                const fullNewProject: Project = {
                    ...project, // Start with the old project to keep all settings
                    name: partialProject.name, // Overwrite name from AI
                    areas: partialProject.areas, // Overwrite areas from AI
                };

                const finalProposal: AiChangeProposal = {
                    summary: rawParsedJson.summary,
                    newProject: fullNewProject,
                };
                
                setProposal(finalProposal);
                return finalProposal;
            } else {
                setError("Die KI konnte keinen Korrekturvorschlag erstellen.");
                return null;
            }

        } catch (e: any) {
            console.error("Error proposing fix:", e);
            setError(`Fehler beim Erstellen des Vorschlags: ${e.message || 'Bitte versuchen Sie es erneut.'}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearProposal = useCallback(() => {
        setProposal(null);
    }, []);

    return { isLoading, error, proposal, proposeFix, clearProposal };
};

// Add a fallback for deviceConfig in case it's missing from project state somehow.
const DEFAULT_DEVICE_CONFIG = {
    scene: {
        label: "S",
        description: "Szene",
        middleGroup: 3,
        feedbackMiddleGroup: 3,
        functions: [
            { name: "Abruf", dpt: "18.001", offset: 0, enabled: true },
        ],
    }
}
