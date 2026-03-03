
import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, ArrowUp, Wand2, ChevronLeft, ChevronRight, Bookmark, BookmarkPlus, Tag, Camera } from 'lucide-react';

interface TransformationControlsProps {
  originalImages: string[];
  activeCharacterName?: string;
  savedPrompts?: string[];
  onReset: () => void;
  onEditReferences: () => void;
  onSubmit: (prompt: string) => void;
  onSavePrompt?: (prompt: string) => void;
  onRemovePrompt?: (prompt: string) => void;
  isProcessing: boolean;
}

export const TransformationControls: React.FC<TransformationControlsProps> = ({
  originalImages,
  activeCharacterName,
  savedPrompts = [],
  onReset,
  onEditReferences,
  onSubmit,
  onSavePrompt,
  onRemovePrompt,
  isProcessing
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const globalSuggestions = [
    "Cyberpunk hacker",
    "Medieval knight",
    "Business suit",
    "Watercolor painting",
    "Tropical beach"
  ];

  const handleSaveClick = () => {
    if (prompt.trim() && onSavePrompt) {
      onSavePrompt(prompt.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center min-h-[80vh]">
      
      {/* Top Section: Multiple Image Previews */}
      <div className="w-full mb-48 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative w-full aspect-[3/4] md:aspect-square max-w-md rounded-3xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl mb-4 group">
          <img 
            src={originalImages[activeImageIdx]} 
            alt="Reference" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          {originalImages.length > 1 && (
            <>
              <button 
                type="button"
                onClick={() => setActiveImageIdx(prev => (prev > 0 ? prev - 1 : originalImages.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                type="button"
                onClick={() => setActiveImageIdx(prev => (prev < originalImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute top-4 right-4 flex gap-2 z-30">
            <button
              type="button"
              onClick={onEditReferences}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-indigo-600 backdrop-blur-xl rounded-full text-white text-xs font-bold transition-all shadow-lg border border-white/10"
            >
              <Camera className="w-4 h-4" />
              Edit Photos
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={isProcessing}
              className="p-2 bg-black/40 hover:bg-red-500 backdrop-blur-xl rounded-full text-white transition-all shadow-lg border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                {originalImages.length} Reference{originalImages.length > 1 ? 's' : ''}
              </span>
              {activeCharacterName && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/30 backdrop-blur-md border border-indigo-400/30 text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
                  Active: {activeCharacterName}
                </span>
              )}
            </div>
            {originalImages.length > 1 && (
              <div className="flex gap-1">
                {originalImages.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImageIdx ? 'bg-indigo-400 w-4' : 'bg-slate-500'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Input Field */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 pb-8 pt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
            
            {/* Prompt Library */}
            <div className="flex flex-col gap-2">
                {(savedPrompts.length > 0) && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <Bookmark className="w-3 h-3" />
                    Vault Prompts
                  </div>
                )}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
                    {/* Character Specific Prompts */}
                    {savedPrompts.map((s, i) => (
                        <div key={`saved-${i}`} className="group/chip relative flex-shrink-0">
                          <button 
                              onClick={() => setPrompt(s)}
                              disabled={isProcessing}
                              className="px-4 py-2 pr-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-medium hover:bg-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                          >
                              <Tag className="w-3 h-3 text-indigo-400" />
                              <span className="max-w-[120px] truncate">{s}</span>
                          </button>
                          {onRemovePrompt && (
                            <button 
                              type="button"
                              onClick={() => onRemovePrompt(s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                    ))}
                    
                    {/* Global Suggestions */}
                    {globalSuggestions.map((s, i) => (
                        <button 
                            key={`global-${i}`}
                            type="button"
                            onClick={() => setPrompt(s)}
                            disabled={isProcessing}
                            className="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-800 p-2 pr-2 rounded-[2rem] border border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg">
                <div className="pl-3 py-3 text-indigo-400">
                    <Wand2 className="w-6 h-6" />
                </div>
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your transformation..."
                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 resize-none py-3.5 px-0 min-h-[48px] max-h-[120px] leading-relaxed text-base"
                    rows={1}
                    disabled={isProcessing}
                    style={{ height: '48px' }}
                />
                
                <div className="flex items-center gap-1.5 mb-0.5">
                  {activeCharacterName && prompt.trim() && !savedPrompts.includes(prompt.trim()) && (
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-indigo-400 transition-all"
                      title="Save to Character Profile"
                    >
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                      type="submit"
                      disabled={!prompt.trim() || isProcessing}
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
                          ${(!prompt.trim() || isProcessing)
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95'
                          }`}
                  >
                      {isProcessing ? (
                          <RotateCcw className="w-5 h-5 animate-spin" />
                      ) : (
                          <ArrowUp className="w-6 h-6" />
                      )}
                  </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
