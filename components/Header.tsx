import React from 'react';
import { Wand2, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            IdentityForge
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-400">
          <span className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer">
            <Layers className="w-4 h-4" />
            <span>History</span>
          </span>
          <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            Powered by Gemini
          </a>
        </div>
      </div>
    </header>
  );
};
