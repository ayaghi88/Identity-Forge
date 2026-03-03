import React, { useState } from 'react';
import { Film, Sparkles, RotateCcw, ArrowRight, ExternalLink, Download } from 'lucide-react';
import { generateVideo } from '../services/gemini';

// The AIStudio global type is assumed to be provided by the environment.
// Using type casting to 'any' for window.aistudio to resolve declaration conflicts.

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Veo engine...');

  const messages = [
    "Analyzing your prompt...",
    "Framing the cinematic shots...",
    "Simulating physics and motion...",
    "Rendering light and shadows...",
    "Assembling frames into a masterpiece...",
    "Final color grading in progress...",
    "Almost there! Preparing your video..."
  ];

  const handleGenerate = async () => {
    try {
      setError(null);
      // Access aistudio via any to bypass declaration conflicts
      const aistudio = (window as any).aistudio;
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }

      setIsGenerating(true);
      setVideoUrl(null);

      // Rotate loading messages
      let msgIdx = 0;
      const interval = setInterval(() => {
        setLoadingMsg(messages[msgIdx % messages.length]);
        msgIdx++;
      }, 10000);

      const url = await generateVideo(prompt);
      setVideoUrl(url);
      clearInterval(interval);
    } catch (err: any) {
      console.error(err);
      const aistudio = (window as any).aistudio;
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key Error. Please ensure you have a valid key from a paid project.");
        await aistudio.openSelectKey();
      } else {
        setError(err.message || "Failed to generate video.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold">
          <Film className="w-4 h-4" />
          VEV 3.1 CINEMATIC ENGINE
        </div>
        <h2 className="text-4xl font-extrabold text-white">Bring your words to life</h2>
        <p className="text-slate-400">Generate stunning 1080p videos from simple text descriptions.</p>
      </div>

      {!videoUrl ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-300">Description</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city in the clouds with flying vehicles and neon sunsets..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl
                ${isGenerating 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] active:scale-95'
                }`}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  {loadingMsg}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Cinematic Video
                </>
              )}
            </button>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Veo requires a paid API key. If prompted, please select a key from a project with 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 hover:underline mx-1">billing enabled</a>. 
                Generation can take 2-4 minutes.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in duration-700">
          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl bg-black">
            <video src={videoUrl} controls autoPlay className="w-full h-full" />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setVideoUrl(null)}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Another Prompt
            </button>
            <a 
              href={videoUrl} 
              download="identityforge-cinematic.mp4"
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
            >
              <Download className="w-5 h-5" />
              Download Video
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};