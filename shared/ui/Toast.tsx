import React from 'react';

interface ToastProps {
    message: string;
    show: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, show }) => {
    return (
        <div
            aria-live="assertive"
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 transform transition-all duration-300 ease-in-out z-50 ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <div className="bg-green-500 text-white font-bold py-2 px-5 rounded-full shadow-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{message}</span>
            </div>
        </div>
    );
};
