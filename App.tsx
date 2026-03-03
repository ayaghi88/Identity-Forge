
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { TransformationControls } from './components/TransformationControls';
import { ResultView } from './components/ResultView';
import { CharacterLibrary } from './components/CharacterLibrary';
import { VideoGenerator } from './components/VideoGenerator';
import { generateVariations } from './services/gemini';
import { AppState, GeneratedImage, AppMode, Character } from './types';
import { AlertTriangle, Info, Camera, Video, Save, Loader2 } from 'lucide-react';

/**
 * Utility to resize base64 images to fit within localStorage limits
 * while maintaining enough quality for AI recognition.
 */
const optimizeImageForStorage = (base64Str: string, maxDim = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.PHOTO);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<GeneratedImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isEditingReferences, setIsEditingReferences] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forge_characters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCharacters(parsed);
      }
    } catch (e) {
      console.error("Failed to load characters:", e);
    }
  }, []);

  const saveToVault = async () => {
    if (!newCharName || originalImages.length === 0) return;
    setIsSaving(true);
    try {
      const optimizedImages = await Promise.all(
        originalImages.map(img => optimizeImageForStorage(img))
      );

      const newChar: Character = {
        id: crypto.randomUUID(),
        name: newCharName,
        images: optimizedImages,
        savedPrompts: [],
        createdAt: Date.now()
      };

      const updated = [newChar, ...characters];
      localStorage.setItem('forge_characters', JSON.stringify(updated));
      setCharacters(updated);
      setActiveCharacterId(newChar.id);
      setNewCharName('');
      setShowSaveModal(false);
    } catch (storageError) {
      setErrorMessage("Vault is full! Please delete some characters.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateCharacterImages = async (newImages: string[]) => {
    setOriginalImages(newImages);
    setIsEditingReferences(false);

    // If we're editing an existing character, sync to vault immediately
    if (activeCharacterId) {
      setIsSaving(true);
      try {
        const optimized = await Promise.all(
          newImages.map(img => optimizeImageForStorage(img))
        );
        const updated = characters.map(c => 
          c.id === activeCharacterId ? { ...c, images: optimized } : c
        );
        setCharacters(updated);
        localStorage.setItem('forge_characters', JSON.stringify(updated));
      } catch (e) {
        setErrorMessage("Failed to sync updates to Vault.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const deleteCharacter = (id: string) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    if (activeCharacterId === id) setActiveCharacterId(null);
    localStorage.setItem('forge_characters', JSON.stringify(updated));
  };

  const savePromptToActiveCharacter = (prompt: string) => {
    if (!activeCharacterId) return;
    const updated = characters.map(char => {
      if (char.id === activeCharacterId) {
        const prompts = char.savedPrompts || [];
        if (!prompts.includes(prompt)) return { ...char, savedPrompts: [...prompts, prompt] };
      }
      return char;
    });
    setCharacters(updated);
    localStorage.setItem('forge_characters', JSON.stringify(updated));
  };

  const removePromptFromActiveCharacter = (prompt: string) => {
    if (!activeCharacterId) return;
    const updated = characters.map(char => {
      if (char.id === activeCharacterId) {
        const prompts = char.savedPrompts || [];
        return { ...char, savedPrompts: prompts.filter(p => p !== prompt) };
      }
      return char;
    });
    setCharacters(updated);
    localStorage.setItem('forge_characters', JSON.stringify(updated));
  };

  const handleCharacterSelect = (char: Character) => {
    setOriginalImages(char.images);
    setActiveCharacterId(char.id);
    setAppState(AppState.IDLE);
    setIsEditingReferences(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImagesSelected = (base64Array: string[]) => {
    setOriginalImages(base64Array);
    if (!activeCharacterId) {
      setShowSaveModal(true);
    }
    setAppState(AppState.IDLE);
    setIsEditingReferences(false);
  };

  const handleReset = () => {
    setOriginalImages([]);
    setActiveCharacterId(null);
    setCurrentResult(null);
    setAppState(AppState.IDLE);
    setIsEditingReferences(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransformation = async (prompt: string) => {
    if (originalImages.length === 0) return;
    setAppState(AppState.PROCESSING);
    setErrorMessage(null);
    setProgress({ current: 1, total: 3 });
    try {
      const resultImages = await generateVariations(
        originalImages, 
        prompt,
        (current, total) => setProgress({ current, total })
      );
      const newResult: GeneratedImage = {
        id: crypto.randomUUID(),
        originalImages,
        resultImages,
        prompt,
        timestamp: Date.now()
      };
      setCurrentResult(newResult);
      setAppState(AppState.SUCCESS);
      setProgress(null);
    } catch (error: any) {
      setAppState(AppState.ERROR);
      setErrorMessage(error.message || "Something went wrong.");
      setProgress(null);
    }
  };

  const activeCharacter = characters.find(c => c.id === activeCharacterId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <Header />
      
      <div className="w-full flex justify-center py-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-16 z-40">
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => { setAppMode(AppMode.PHOTO); handleReset(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${appMode === AppMode.PHOTO ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Camera className="w-4 h-4" />
            Photo Forge
          </button>
          <button 
            onClick={() => { setAppMode(AppMode.VIDEO); handleReset(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${appMode === AppMode.VIDEO ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Video className="w-4 h-4" />
            Cinematic Forge
          </button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 pt-8 pb-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {appMode === AppMode.PHOTO ? (
            <motion.div 
              key="photo-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              {(originalImages.length === 0 || isEditingReferences) ? (
                <div className="w-full flex flex-col items-center">
                  {!isEditingReferences && (
                    <CharacterLibrary 
                      characters={characters} 
                      onSelect={handleCharacterSelect} 
                      onDelete={deleteCharacter}
                      onAddNew={() => {
                        handleReset();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                    />
                  )}
                  
                  <div className="text-center mb-12 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                      Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Consistency</span>
                    </h1>
                    <p className="text-lg text-slate-400">
                      {isEditingReferences ? "Refine your character's photo collection" : "Forge a library of signature looks with consistent identities."}
                    </p>
                  </div>
                  
                  <ImageUploader 
                    initialImages={originalImages}
                    onImagesSelected={isEditingReferences ? updateCharacterImages : handleImagesSelected} 
                    onCancel={isEditingReferences ? () => setIsEditingReferences(false) : undefined}
                  />
                </div>
              ) : (
                !currentResult ? (
                  <TransformationControls 
                    originalImages={originalImages}
                    activeCharacterName={activeCharacter?.name}
                    savedPrompts={activeCharacter?.savedPrompts}
                    onReset={handleReset}
                    onEditReferences={() => setIsEditingReferences(true)}
                    onSubmit={handleTransformation}
                    onSavePrompt={savePromptToActiveCharacter}
                    onRemovePrompt={removePromptFromActiveCharacter}
                    isProcessing={appState === AppState.PROCESSING}
                  />
                ) : (
                  <ResultView 
                    data={currentResult}
                    onBack={() => setCurrentResult(null)}
                    onTryAgain={() => setCurrentResult(null)}
                  />
                )
              )}
            </motion.div>
          ) : (
            <motion.div
              key="video-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <VideoGenerator />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {appState === AppState.PROCESSING && progress && (
          <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Forging Transformation...</h3>
                <p className="text-slate-400 text-center text-sm leading-relaxed">
                  Variation {progress.current} of {progress.total} is being crafted.
                </p>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000 ease-in-out" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] w-full max-w-md p-4 bg-red-900 border border-red-500 rounded-2xl flex items-start gap-3 shadow-2xl animate-in slide-in-from-bottom-4">
             <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
             <div className="flex-1">
               <p className="text-sm font-medium text-red-100">{errorMessage}</p>
             </div>
             <button onClick={() => setErrorMessage(null)} className="text-xs text-red-200 underline">Dismiss</button>
           </div>
        )}

        {/* Save Character Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Save Character?</h3>
                <p className="text-slate-400 text-sm">Saving to the vault preserves this identity across sessions.</p>
              </div>
              <input 
                type="text" 
                placeholder="Name (e.g., 'Professional Me')" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                autoFocus
                disabled={isSaving}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowSaveModal(false); setAppState(AppState.IDLE); }}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  Skip
                </button>
                <button 
                  onClick={saveToVault}
                  disabled={!newCharName.trim() || isSaving}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save to Vault'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="w-full py-8 border-t border-slate-900 text-center">
        <p className="text-sm text-slate-500 italic">© {new Date().getFullYear()} IdentityForge AI. Multimodal Creative Engine.</p>
      </footer>
    </div>
  );
}
