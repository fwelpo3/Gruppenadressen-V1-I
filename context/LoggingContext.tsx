
import React, { createContext, useState, useCallback, useContext } from 'react';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    data?: any[];
}

interface LoggingContextType {
    isLoggingEnabled: boolean;
    logs: LogEntry[];
    enableLogging: () => void;
    disableLogging: () => void;
    clearLogs: () => void;
    log: (level: LogLevel, message: string, ...data: any[]) => void;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

// In-memory logging service
const loggingService = {
    logs: [] as LogEntry[],
    isEnabled: false, // Default to disabled
    
    log(level: LogLevel, message: string, ...data: any[]) {
        if (!this.isEnabled) return;
        
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            data: data.length > 0 ? data.map(d => JSON.parse(JSON.stringify(d))) : undefined // Deep copy data to avoid mutation issues
        };
        this.logs.push(entry);
        
        // Keep the log size manageable
        if (this.logs.length > 200) {
            this.logs.shift();
        }
    },

    getLogs() {
        return this.logs;
    },
    
    clear() {
        this.logs = [];
    },
    
    enable() {
        this.isEnabled = true;
        this.log('info', 'Logging enabled.');
    },
    
    disable() {
        this.log('info', 'Logging disabled.');
        this.isEnabled = false;
    }
};

export const LoggingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<LogEntry[]>(loggingService.getLogs());
    const [isEnabled, setIsEnabled] = useState(loggingService.isEnabled);
    
    const log = useCallback((level: LogLevel, message: string, ...data: any[]) => {
        loggingService.log(level, message, ...data);
        setLogs([...loggingService.getLogs()]);
    }, []);

    const enableLogging = useCallback(() => {
        loggingService.enable();
        setIsEnabled(true);
        setLogs([...loggingService.getLogs()]);
    }, []);

    const disableLogging = useCallback(() => {
        loggingService.disable();
        setIsEnabled(false);
    }, []);

    const clearLogs = useCallback(() => {
        loggingService.clear();
        log('info', 'Logs cleared.');
        setLogs([...loggingService.getLogs()]);
    }, [log]);

    const value = {
        isLoggingEnabled: isEnabled,
        logs,
        enableLogging,
        disableLogging,
        clearLogs,
        log
    };

    return (
        <LoggingContext.Provider value={value}>
            {children}
        </LoggingContext.Provider>
    );
};

export const useLogging = () => {
    const context = useContext(LoggingContext);
    if (context === undefined) {
        throw new Error('useLogging must be used within a LoggingProvider');
    }
    return context;
};
