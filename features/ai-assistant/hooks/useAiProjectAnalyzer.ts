import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project, AiAnalysisResult } from '../../../domain';

const analysisFindingSchema = {
    type: Type.OBJECT,
    properties: {
        severity: { type: Type.STRING, enum: ['info', 'warning', 'suggestion'], description: "Die Art des Hinweises: 'info' für allgemeine Informationen, 'warning' für potenzielle Probleme, 'suggestion' für Optimierungsvorschläge." },
        title: { type: Type.STRING, description: "Eine kurze, prägnante Überschrift für den Hinweis." },
        description: { type: Type.STRING, description: "Eine detaillierte Beschreibung des Hinweises und warum er relevant ist." },
        context: { type: Type.STRING, description: "Der spezifische Kontext, auf den sich der Hinweis bezieht, z.B. der Name des Raumes oder Bereichs." },
        isActionable: { type: Type.BOOLEAN, description: "Setze dies auf true, wenn du glaubst, dass du diesen Hinweis automatisch durch eine Projektänderung beheben kannst."}
    },
    required: ['severity', 'title', 'description']
};

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        consistency: {
            type: Type.ARRAY,
            description: "Hinweise zur Konsistenz, z.B. bei Benennungen oder Abkürzungen.",
            items: analysisFindingSchema
        },
        completeness: {
            type: Type.ARRAY,
            description: "Hinweise zur Vollständigkeit, z.B. fehlende Standard-Funktionen in bestimmten Räumen.",
            items: analysisFindingSchema
        },
        optimizations: {
            type: Type.ARRAY,
            description: "Vorschläge zur Optimierung, z.B. das Hinzufügen von Zentralfunktionen oder Szenen.",
            items: analysisFindingSchema
        }
    },
    required: ['consistency', 'completeness', 'optimizations']
};

const analysisSystemInstruction = `Du bist ein erfahrener KNX-Systemintegrator und Gutachter. Deine Aufgabe ist es, eine gegebene KNX-Projektstruktur, die als JSON-Objekt bereitgestellt wird, zu analysieren. Bewerte die Struktur nach folgenden Kriterien:
1.  **Konsistenz:** Prüfe auf einheitliche Namensschemata bei Räumen und Bereichen. Sind die Abkürzungen sinnvoll und einheitlich?
2.  **Vollständigkeit:** Identifiziere Räume, denen typische Funktionen fehlen. Zum Beispiel: Fehlt in einem Badezimmer Licht? Fehlt in einem Wohnzimmer eine Heizungssteuerung?
3.  **Optimierungspotenzial & Szenen:** Mache Vorschläge für Verbesserungen.
    - Identifiziere Räume mit Kombinationen von Funktionen (z.B. dimmbares Licht und Jalousien), die sich für Szenen eignen (z.B. "TV Abend", "Entspannung"). Schlage das Hinzufügen einer neuen Szene zu diesem Raum vor. Formuliere den Vorschlag so, dass klar ist, was die Szene tun würde.
    - Gibt es Möglichkeiten für sinnvolle Zentralfunktionen (z.B. "Alles Aus")?
    - Gibt es redundante oder unlogische Funktionszuweisungen?

Für jeden Hinweis, den du als 'warning' oder 'suggestion' einstufst, entscheide, ob du ihn selbst beheben könntest, wenn du die Berechtigung hättest, das Projekt-JSON zu ändern. Wenn ja, setze 'isActionable' auf 'true'. Das Hinzufügen einer Szene ist immer eine 'actionable' Aufgabe.

Gib deine Analyse als JSON-Objekt zurück, das dem vorgegebenen Schema entspricht. Formuliere die Titel und Beschreibungen klar, prägnant und hilfreich für einen KNX-Planer. Sei kritisch, aber konstruktiv. Wenn das Projekt gut aussieht, gib positives Feedback und nur wenige, aber hochwertige Vorschläge.`;

const projectToText = (project: Project): string => {
    const simplifiedProject = {
        projectName: project.name,
        areas: project.areas.map(area => ({
            name: area.name,
            abbreviation: area.abbreviation,
            mainGroup: area.mainGroup,
            rooms: area.rooms.map(room => ({
                name: room.name,
                functions: room.functionInstances.reduce((acc, inst) => {
                    const typeKey = inst.type as keyof typeof acc;
                    acc[typeKey] = (acc[typeKey] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            }))
        }))
    };
    return `Analysiere bitte dieses KNX-Projekt: ${JSON.stringify(simplifiedProject, null, 2)}`;
};

export const useAiProjectAnalyzer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);

    const analyzeProject = useCallback(async (project: Project) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API-Schlüssel ist nicht konfiguriert.");
            }
             if (project.areas.length === 0) {
                throw new Error("Das Projekt ist leer und kann nicht analysiert werden.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const promptText = projectToText(project);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptText,
                config: {
                    systemInstruction: analysisSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: analysisResponseSchema,
                },
            });

            const jsonString = response.text.trim();
            const parsedJson: AiAnalysisResult = JSON.parse(jsonString);

            setAnalysisResult(parsedJson);

        } catch (e: any) {
            console.error("Error analyzing project:", e);
            setError(`Fehler bei der Analyse: ${e.message || 'Bitte versuchen Sie es erneut.'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, analysisResult, analyzeProject };
};
