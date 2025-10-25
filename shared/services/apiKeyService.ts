
// This service provides a robust way to manage the API key globally 
// without relying on fragile mechanisms like manipulating a fake process.env object.

let apiKey = '';

/**
 * Sets the global API key for all subsequent AI calls.
 * @param newKey The new Gemini API key.
 */
export const setApiKey = (newKey: string): void => {
    apiKey = newKey;
};

/**
 * Retrieves the currently set global API key.
 * @returns The current Gemini API key string.
 */
export const getApiKey = (): string => {
    return apiKey;
};
