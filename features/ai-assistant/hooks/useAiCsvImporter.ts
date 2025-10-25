

import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AiProjectSuggestion } from '../../../domain';
import { getApiKey } from '../../../shared/services/apiKeyService';

// Reusing the same schema as the wizard for a consistent output structure
const csvImportResponseSchema = {
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

const csvImportSystemInstruction = `Du bist ein Experte für KNX-Gebäudeautomation. Deine Aufgabe ist es, aus einer CSV-Liste von KNX-Gruppenadressen eine Projektstruktur zu rekonstruieren. Die CSV-Daten enthalten typischerweise Spalten wie Adresse, Name und DPT.
Analysiere die 'Name'-Spalte jeder Gruppenadresse (z.B. 'EG Wohnzimmer Licht Decke Schalten').
1.  **Inferiere Bereiche:** Identifiziere Stockwerke oder Gebäudeteile aus den Namen (z.B. 'EG', 'OG', 'Keller', 'Garten'). Erstelle daraus einen Bereichsnamen (z.B. 'Erdgeschoss') und eine kurze, passende Abkürzung ('EG').
2.  **Inferiere Räume:** Identifiziere Raumnamen (z.B. 'Wohnzimmer', 'Küche', 'Bad').
3.  **Gruppiere Adressen:** Fasse alle Gruppenadressen, die zum selben Raum gehören, zusammen.
4.  **Zähle Funktionen:** Zähle für jeden Raum, wie viele unterschiedliche Geräte jedes Typs vorhanden sind. Verwende **ausschließlich** die folgenden Funktionstypen in deiner JSON-Antwort: 'lightSwitch', 'lightDim', 'blinds', 'heating'.
    - Leite den Funktionstyp aus gängigen Schlüsselwörtern ab (z.B. Licht, Leuchte -> light; Jalousie, Rollladen -> blinds; Heizung, HKL, Temp -> heating).
    - Unterscheide zwischen schaltbaren ('lightSwitch') und dimmbaren ('lightDim') Lichtern. Schlüsselwörter wie 'Dimmen' oder DPTs wie '3.007' oder '5.001' deuten auf 'lightDim' hin. Wenn unklar, nimm 'lightSwitch' an.
    - Zähle jedes Gerät nur einmal pro Raum (z.B. 'Licht Decke Schalten', 'Licht Decke RM', 'Licht Decke Wert' zählen zusammen als ein 'lightDim' oder 'lightSwitch').
5.  **Gib eine JSON-Antwort zurück:** Deine Ausgabe MUSS ein JSON-Objekt sein, das exakt dem vorgegebenen Schema entspricht und die von dir abgeleitete Struktur darstellt.`;


export const useAiCsvImporter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const importProjectFromCsv = useCallback(async (csvContent: string): Promise<AiProjectSuggestion | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const apiKey = getApiKey();
            if (!apiKey) {
                throw new Error("API-Schlüssel ist nicht konfiguriert.");
            }
            if (!csvContent.trim()) {
                throw new Error("Die CSV-Datei ist leer.");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `Bitte analysiere die folgende CSV-Datei mit KNX-Gruppenadressen und erstelle eine Projektstruktur daraus:\n\n${csvContent}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: csvImportSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: csvImportResponseSchema,
                },
            });

            const jsonString = response.text.trim();
            let parsedJson = JSON.parse(jsonString);

            // Add unique IDs for easier state management in React, same as in wizard
            parsedJson = parsedJson.map((area: any) => ({
                ...area,
                id: `ai-area-${Math.random()}`,
                rooms: area.rooms.map((room: any) => ({
                    ...room,
                    id: `ai-room-${Math.random()}`
                }))
            }));

            return parsedJson;

        } catch (e: any) {
            console.error("Error importing from CSV:", e);
            const errorMessage = `Fehler beim CSV-Import: ${e.message || 'Bitte prüfen Sie die Datei und versuchen Sie es erneut.'}`;
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, importProjectFromCsv };
};
