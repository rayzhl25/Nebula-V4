import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video as VideoIcon, Loader2, Key } from 'lucide-react';
import { LOCALE } from '../constants';
import { Language } from '../types';
import { generateVideoWithVeo, checkApiKey, openKeySelection } from '../services/geminiService';

interface VideoGeneratorProps {
  lang: Language;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey().then(setHasKey);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    // Key Check before start
    const currentHasKey = await checkApiKey();
    if (!currentHasKey) {
        setHasKey(false);
        return;
    }

    setLoading(true);
    setVideoUrl(null);
    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const url = await generateVideoWithVeo(base64Data, mimeType, prompt);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING' || err.toString().includes('API_KEY_MISSING')) {
         setHasKey(false);
      } else {
         alert('Video generation failed. Please check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeySelection = async () => {
    await openKeySelection();
    // Optimistically set true as per guide, actual validation happens on generate
    setHasKey(true);
  };

  if (!hasKey) {
      return (
          <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-amber-100 p-4 rounded-full">
                  <Key className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t.apiKeyRequired}</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">{t.billingInfo}</p>
              <div className="text-sm text-blue-500 hover:underline">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer">
                     Google Gemini API Billing Docs
                  </a>
              </div>
              <button 
                onClick={handleKeySelection}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                {t.selectKey}
              </button>
          </div>
      )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <VideoIcon className="text-nebula-500" />
          {t.videoGenerator}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.veoDescription}</p>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`flex-1 min-h-[200px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${image ? 'border-nebula-500 bg-nebula-50 dark:bg-nebula-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-nebula-400'}`}
             >
               {image ? (
                 <img src={image} alt="Source" className="max-h-full max-w-full object-contain rounded-md" />
               ) : (
                 <div className="text-center p-6">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t.uploadImage}</p>
                 </div>
               )}
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 accept="image/png, image/jpeg, image/webp" 
                 className="hidden" 
               />
             </div>
             
             <input 
               type="text" 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder={t.videoPromptPlaceholder}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
             />

             <button 
               onClick={handleGenerate}
               disabled={!image || loading}
               className="w-full bg-nebula-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-nebula-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" /> : <VideoIcon size={20} />}
               {t.generate} (Veo)
             </button>
          </div>

          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-black/5 dark:bg-black/20">
             {loading ? (
                <div className="text-center">
                   <Loader2 className="h-12 w-12 text-nebula-500 animate-spin mx-auto mb-4" />
                   <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{t.loading}</p>
                   <p className="text-gray-400 text-sm mt-2">This may take a minute or two.</p>
                </div>
             ) : videoUrl ? (
                <video controls autoPlay loop className="max-h-full max-w-full rounded-lg shadow-2xl">
                   <source src={videoUrl} type="video/mp4" />
                   Your browser does not support the video tag.
                </video>
             ) : (
                <div className="text-center text-gray-400">
                   <VideoIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                   <p className="text-lg">Generated video will appear here</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default VideoGenerator;