import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AiProjectSuggestion } from '../../../domain';
import { fileToBase64 } from '../../../shared/utils/files';

const wizardResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name des Bereichs, z.B. 'Erdgeschoss'" },
      abbreviation: { type: Type.STRING, description: "Eine kurze, einzigartige Abkürzung für den Bereich, z.B. 'EG', max 3 Zeichen." },
      rooms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name des Raumes, z.B. 'Wohnzimmer'" },
            functions: {
              type: Type.OBJECT,
              description: "Ein Objekt, das die Anzahl der jeweiligen Funktionen enthält. Nur Funktionen mit einer Anzahl > 0 aufnehmen.",
              properties: {
                lightSwitch: { type: Type.INTEGER, description: "Anzahl schaltbarer Lichter" },
                lightDim: { type: Type.INTEGER, description: "Anzahl dimmbarer Lichter" },
                blinds: { type: Type.INTEGER, description: "Anzahl Jalousien/Rollläden" },
                heating: { type: Type.INTEGER, description: "Anzahl Heizungsregler" }
              }
            }
          },
          required: ['name', 'functions']
        }
      }
    },
    required: ['name', 'abbreviation', 'rooms']
  }
};

const wizardSystemInstruction = `Du bist ein Experte für KNX-Gebäudeautomation. Deine Aufgabe ist es, aus einer textuellen Beschreibung oder einem Grundriss eine KNX-Projektstruktur zu extrahieren. Identifiziere Bereiche (Stockwerke) und Räume. Weise jedem Raum basierend auf seiner typischen Nutzung Standard-KNX-Funktionen zu. Verwende nur diese Funktionstypen: 'lightSwitch', 'lightDim', 'blinds', 'heating'. Generiere sinnvolle, kurze Abkürzungen für die Bereiche.`;


export const useAiProjectGenerator = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestion, setSuggestion] = useState<AiProjectSuggestion | null>(null);

    const generateProject = useCallback(async (text: string, imageFile?: File | null) => {
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API-Schlüssel ist nicht konfiguriert.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const parts: any[] = [{ text }];

            if (imageFile) {
                const base64Data = await fileToBase64(imageFile);
                parts.unshift({
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Data,
                    },
                });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: {
                    systemInstruction: wizardSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: wizardResponseSchema,
                },
            });

            const jsonString = response.text.trim();
            let parsedJson = JSON.parse(jsonString);

            // Add unique IDs for easier state management in React
            parsedJson = parsedJson.map((area: any) => ({
                ...area,
                id: `ai-area-${Math.random()}`,
                rooms: area.rooms.map((room: any) => ({
                    ...room,
                    id: `ai-room-${Math.random()}`
                }))
            }));

            setSuggestion(parsedJson);

        } catch (e: any) {
            console.error("Error generating project structure:", e);
            setError(`Fehler bei der Generierung: ${e.message || 'Bitte versuchen Sie es erneut.'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, suggestion, generateProject };
};