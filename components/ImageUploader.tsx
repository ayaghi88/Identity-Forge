
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, Image as ImageIcon, X, Check } from 'lucide-react';

interface ImageUploaderProps {
  onImagesSelected: (base64Array: string[]) => void;
  initialImages?: string[];
  onCancel?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImagesSelected, 
  initialImages = [],
  onCancel 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>(initialImages);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync previews if initialImages changes (e.g. when entering edit mode)
  useEffect(() => {
    setPreviews(initialImages);
  }, [initialImages]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      processFiles(files);
    }
  }, [previews]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const processFiles = async (files: File[]) => {
    setError(null);
    
    if (previews.length + files.length > 8) {
      setError("Please select a maximum of 8 reference photos total.");
      return;
    }

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setError("Some files were skipped. Please upload valid images only.");
    }

    const largeFiles = validFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (largeFiles.length > 0) {
      setError("Some files are too large. Max size is 10MB per image.");
      return;
    }

    const base64Promises = validFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(base64Promises);
      setPreviews(prev => [...prev, ...results]);
    } catch (err) {
      setError("Failed to read some files.");
    }
  };

  const handleConfirm = () => {
    if (previews.length > 0) {
      onImagesSelected(previews);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden" 
        onChange={handleFileChange}
      />

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`space-y-6 bg-slate-900/50 p-6 rounded-[2.5rem] border transition-all duration-300 shadow-2xl ${isDragging ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]' : 'border-slate-800'}`}
      >
        <div className="text-center space-y-2 mb-2">
          <h3 className="text-2xl font-bold text-white">
            {initialImages.length > 0 ? 'Reference Management' : 'Identity Setup'}
          </h3>
          <p className="text-slate-400 text-sm">
            {initialImages.length > 0 
              ? 'Add or remove photos to refine identity consistency' 
              : 'Upload 1-8 photos of the person you want to transform'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 group animate-in zoom-in duration-300">
              <img src={src} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button 
            onClick={handleClick}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 transition-all group"
          >
            <div className="p-3 rounded-full bg-slate-700 group-hover:bg-indigo-500/20 transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold">Add More</span>
          </button>
        </div>
        
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            disabled={previews.length === 0}
            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {initialImages.length > 0 ? 'Update Collection' : 'Confirm Identity'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
