
import React, { useState } from 'react';
import { Download, ArrowLeft, RefreshCw, Check, FolderDown } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ResultViewProps {
  data: GeneratedImage;
  onBack: () => void;
  onTryAgain: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onBack, onTryAgain }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refIndex, setRefIndex] = useState(0);
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.resultImages[selectedIndex];
    link.download = `identity-forge-${data.timestamp}-${selectedIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < data.resultImages.length; i++) {
      const link = document.createElement('a');
      link.href = data.resultImages[i];
      link.download = `identity-forge-${data.timestamp}-${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="flex flex-col xl:flex-row items-center justify-between mb-8 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors self-start xl:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Edit</span>
        </button>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-end">
          <button onClick={onTryAgain} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors border border-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Try Another Prompt</span>
          </button>
          
          <button onClick={handleDownloadAll} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors border border-slate-600">
            <FolderDown className="w-4 h-4" />
            <span>Download All</span>
          </button>

          <button onClick={handleDownload} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <Download className="w-4 h-4" />
            <span>Download Selected</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-4 flex flex-col space-y-4">
           <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-full flex flex-col">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Original References ({data.originalImages.length})</h3>
              <div className="relative flex-1 min-h-[300px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                 <img src={data.originalImages[refIndex]} alt="Original Reference" className="absolute inset-0 w-full h-full object-cover" />
                 {data.originalImages.length > 1 && (
                   <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2">
                     {data.originalImages.map((_, i) => (
                       <button key={i} onClick={() => setRefIndex(i)} className={`w-2 h-2 rounded-full border border-white/20 ${i === refIndex ? 'bg-indigo-500 w-6' : 'bg-black/50'} transition-all`} />
                     ))}
                   </div>
                 )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Your Command</h3>
                <p className="text-slate-200 font-light italic leading-relaxed">"{data.prompt}"</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="relative w-full aspect-[4/3] md:aspect-video lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
            <img src={data.resultImages[selectedIndex]} alt="Generated Result" className="w-full h-full object-contain bg-black/40 backdrop-blur-sm" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-white text-xs font-medium">Variation {selectedIndex + 1} of {data.resultImages.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {data.resultImages.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedIndex(idx)} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group ${selectedIndex === idx ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105' : 'border-slate-700 opacity-70 hover:opacity-100'}`}>
                <img src={img} alt={`Variation ${idx + 1}`} className="w-full h-full object-cover" />
                {selectedIndex === idx && (
                  <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                    <div className="bg-indigo-600 rounded-full p-1 shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
