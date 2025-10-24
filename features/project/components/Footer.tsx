
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-xs text-slate-500">
            <p>Standard-Hauptgruppen: Bereiche definieren HGs | 8=Szenen | 9=Zentral</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} KNX GA-Generator Pro. Ein Werkzeug für professionelle KNX-Planung.</p>
        </footer>
    );
};
