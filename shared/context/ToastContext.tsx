import React, { createContext, useState, useCallback, useContext } from 'react';
import { Toast } from '../../shared/ui/Toast';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = useCallback((message: string) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast message={toast.message} show={toast.show} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
