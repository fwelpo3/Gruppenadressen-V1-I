
import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AiFunctionSuggestion } from '../../../domain';
import { getApiKey } from '../../../shared/services/apiKeyService';

const roomSuggestionSchema = {
    type: Type.OBJECT,
    description: "Ein Objekt, das die Anzahl der jeweiligen Funktionen enthält. Nur Funktionen mit einer Anzahl > 0 aufnehmen.",
    properties: {
        lightSwitch: { type: Type.INTEGER, description: "Anzahl schaltbarer Lichter" },
        lightDim: { type: Type.INTEGER, description: "Anzahl dimmbarer Lichter" },
        blinds: { type: Type.INTEGER, description: "Anzahl Jalousien/Rollläden" },
        heating: { type: Type.INTEGER, description: "Anzahl Heizungsregler" }
    }
};

export const useRoomSuggestion = (roomName: string, isEnabled: boolean) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestion, setSuggestion] = useState<AiFunctionSuggestion | null>(null);

    const generateSuggestion = useCallback(async (name: string) => {
        if (!name.trim() || !isEnabled) {
            setSuggestion(null);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const apiKey = getApiKey();
            if (!apiKey) {
                // Do not throw an error here, just fail silently as it's an enhancement
                console.warn("API-Schlüssel für Raum-Vorschläge nicht konfiguriert.");
                return;
            }
            const ai = new GoogleGenAI({ apiKey });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Basierend auf dem Raumnamen "${name}", schlage eine typische Ausstattung mit KNX-Funktionen vor.`,
                config: {
                    systemInstruction: `Du bist ein KNX-Experte. Deine Aufgabe ist es, für einen gegebenen Raumnamen eine sinnvolle Grundausstattung an Funktionen vorzuschlagen. Antworte ausschließlich mit einem JSON-Objekt, das dem vorgegebenen Schema entspricht. Halte die Anzahl der Funktionen realistisch für einen typischen Raum dieser Art in einem Wohngebäude.`,
                    responseMimeType: "application/json",
                    responseSchema: roomSuggestionSchema,
                },
            });

            const jsonString = response.text.trim();
            const parsedJson: AiFunctionSuggestion = JSON.parse(jsonString);

            // Nur Vorschläge anzeigen, die auch Inhalt haben
            if (Object.keys(parsedJson).length > 0) {
                setSuggestion(parsedJson);
            }

        } catch (e) {
            console.error("Error generating room suggestion:", e);
            setError("Fehler beim Abrufen des Vorschlags.");
        } finally {
            setIsLoading(false);
        }
    }, [isEnabled]);
    
    useEffect(() => {
        if(isEnabled) {
            generateSuggestion(roomName);
        } else {
            setSuggestion(null);
        }
    }, [roomName, isEnabled, generateSuggestion]);

    const clearSuggestion = useCallback(() => {
        setSuggestion(null);
        setError(null);
    }, []);

    return { isLoading, error, suggestion, clearSuggestion };
};
