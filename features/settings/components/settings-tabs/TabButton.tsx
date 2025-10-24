import React from 'react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${
            active
                ? 'text-sky-400 border-sky-400'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);