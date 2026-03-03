
import React from 'react';
import { User, Trash2, Plus } from 'lucide-react';
import { Character } from '../types';

interface CharacterLibraryProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const CharacterLibrary: React.FC<CharacterLibraryProps> = ({ 
  characters, 
  onSelect, 
  onDelete, 
  onAddNew 
}) => {
  if (characters.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Character Vault
        </h2>
        <button 
          onClick={onAddNew}
          className="text-sm font-medium text-indigo-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {characters.map((char) => (
          <div 
            key={char.id}
            className="group relative bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-indigo-500 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
            onClick={() => onSelect(char)}
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img 
                src={char.images[0]} 
                alt={char.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-xs font-bold text-white truncate">{char.name}</p>
              <p className="text-[10px] text-slate-400">{char.images.length} Ref Photos</p>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(char.id);
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-red-500 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
