import React from 'react';

interface FunctionCounterProps {
    count: number;
    onChange: (newCount: number) => void;
}

export const FunctionCounter: React.FC<FunctionCounterProps> = ({ count, onChange }) => {
    const handleChange = (delta: number) => {
        onChange(Math.max(0, count + delta));
    };
    return (
        <div className="flex items-center gap-1">
            <button onClick={() => handleChange(-1)} className="px-2 py-0.5 bg-slate-600 hover:bg-slate-500 rounded">-</button>
            <input
                type="number"
                min="0"
                value={count}
                onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-12 text-center bg-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button onClick={() => handleChange(1)} className="px-2 py-0.5 bg-slate-600 hover:bg-slate-500 rounded">+</button>
        </div>
    );
};
