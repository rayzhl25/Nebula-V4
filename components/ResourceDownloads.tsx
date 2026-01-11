import React, { useState } from 'react';
import { Download, ExternalLink, Copy, Check, Monitor, Server, BookOpen, FileCode } from 'lucide-react';
import { LOCALE, DOWNLOAD_RESOURCES } from '../constants';
import { Language } from '../types';

interface ResourceDownloadsProps {
  lang: Language;
}

const ResourceDownloads: React.FC<ResourceDownloadsProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'windows': return <Monitor size={32} />;
      case 'linux': return <Server size={32} />;
      case 'book': return <BookOpen size={32} />;
      case 'code': return <FileCode size={32} />;
      default: return <Download size={32} />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'installer': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'document': return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'template': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
         <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <Download className="text-nebula-500" />
           {t.downloadsTitle}
         </h1>
         <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.downloadsDesc}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {DOWNLOAD_RESOURCES.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
             
             <div className="flex items-start gap-4 mb-4">
               <div className={`p-4 rounded-xl flex items-center justify-center ${getColor(item.type)}`}>
                 {getIcon(item.icon)}
               </div>
               <div>
                 <h3 className="font-bold text-gray-800 dark:text-white text-lg">{t[item.titleKey as keyof typeof t]}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t[item.descKey as keyof typeof t]}</p>
               </div>
             </div>

             <div className="flex-1"></div>

             {/* Password Section if exists */}
             {item.password && (
               <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-between border border-gray-100 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400 text-xs block mb-0.5">{t.accessPwd}</span>
                    <span className="font-mono font-bold tracking-wide">{item.password}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(item.id, item.password!)}
                    className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-500 dark:text-gray-300 relative group"
                    title={t.copyPwd}
                  >
                    {copiedId === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    
                    {/* Tooltip */}
                    {copiedId === item.id && (
                      <span className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in">
                        {t.pwdCopied}
                      </span>
                    )}
                  </button>
               </div>
             )}

             <a 
               href={item.url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-full bg-nebula-600 hover:bg-nebula-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
             >
               {item.type === 'document' ? <ExternalLink size={18} /> : <Download size={18} />}
               {item.type === 'document' ? t.openLinkBtn : t.downloadBtn}
             </a>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceDownloads;