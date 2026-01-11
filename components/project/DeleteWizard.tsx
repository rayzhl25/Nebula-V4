import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  Radiation,
  Monitor,
  Server,
  Database,
  Settings,
  Skull,
  AlertCircle
} from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language } from '../../types';
import { getProjectDeleteInfo, deleteProject } from '../../services/mockService';

interface DeleteWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: number) => void;
  project: any;
  lang: Language;
}

/**
 * 项目删除向导 (DeleteWizard)
 * 包含 4 个步骤：确认项目 -> 选择删除组件 -> 最终确认 -> 删除进度
 * 特点：使用了模拟的删除进度动画和复杂的组件选择逻辑。
 */
const DeleteWizard: React.FC<DeleteWizardProps> = ({ isOpen, onClose, onSuccess, project, lang }) => {
  const t = LOCALE[lang];
  const [step, setStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 最终确认所需的输入匹配
  const [confirmName, setConfirmName] = useState('');
  const [finalCheck, setFinalCheck] = useState(false);
  
  // 进度条状态
  const [progress, setProgress] = useState(0);
  
  // 删除信息加载状态
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [info, setInfo] = useState<any>(null);
  
  // 组件选择状态
  const [selection, setSelection] = useState({
    frontend: true,
    backend: true,
    database: true,
    config: true,
    backups: false,
    logs: false
  });

  // 打开时获取项目的依赖信息（模拟 API 调用）
  useEffect(() => {
    if (isOpen && project) {
        setLoadingInfo(true);
        getProjectDeleteInfo(project.id).then(data => {
            setInfo(data);
            setLoadingInfo(false);
        }).catch(() => setLoadingInfo(false));
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  // 执行删除逻辑
  const executeDelete = async () => {
     setIsDeleting(true);
     setStep(4); // 跳转到进度条页面
     
     // 模拟删除进度动画 (0 -> 100%)
     const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + 10));
     }, 200);

     try {
         // 调用后端 API
         await deleteProject(project.id, {
             deleteComponents: selection,
             confirmProjectName: confirmName,
             timestamp: new Date().toISOString()
         });
         
         // 完成后清理
         clearInterval(interval);
         setProgress(100);
         setTimeout(() => {
             onSuccess(project.id);
             onClose();
         }, 500);
     } catch (error) {
         console.error(error);
         clearInterval(interval);
         setIsDeleting(false);
         alert("Delete failed");
     }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const all = selection.frontend && selection.backend && selection.database && selection.config;
    setSelection(prev => ({ ...prev, frontend: !all, backend: !all, database: !all, config: !all }));
  };

  const renderContent = () => {
      if (loadingInfo) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-nebula-500" size={40} /></div>;
      
      const safeInfo = info || { 
          name: project.name, 
          size: project.size || 'Unknown',
          stats: { frontend: {}, backend: {}, database: {}, config: {} },
          backups: {}, logs: {}
      };

      switch(step) {
          case 1: // 步骤 1: 风险警告与基本信息确认
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                  <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">{t.warningTitle}</h4>
                                  <p className="text-sm text-amber-700 dark:text-amber-300">{t.warningDesc}</p>
                              </div>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <h3 className="font-bold text-gray-800 dark:text-white text-lg">{t.confirmDelProject}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{t.confirmDelDesc}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div><span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.projectName}</span><span className="text-base text-gray-800 dark:text-white font-medium">{project.name}</span></div>
                                <div><span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.projectID}</span><span className="text-base text-gray-800 dark:text-white font-mono">{project.number}</span></div>
                                <div><span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.projectSize}</span><span className="text-base text-gray-800 dark:text-white">{safeInfo.size}</span></div>
                          </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-300 font-bold text-sm"><Radiation size={16} />{t.associatedResources}</div>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 pl-1">
                              <li>{t.resFrontend}</li><li>{t.resBackend}</li><li>{t.resDb}</li>
                          </ul>
                      </div>
                  </div>
              );
          case 2: // 步骤 2: 选择要删除的具体资源
              const components = [
                  { id: 'frontend', icon: Monitor, title: t.compFrontend, desc: t.compFrontendDesc, color: 'blue' },
                  { id: 'backend', icon: Server, title: t.compBackend, desc: t.compBackendDesc, color: 'cyan' },
                  { id: 'database', icon: Database, title: t.compDB, desc: t.compDBDesc, color: 'amber' },
                  { id: 'config', icon: Settings, title: t.compConfig, desc: t.compConfigDesc, color: 'purple' }
              ];
              return (
                  <div className="space-y-6 animate-fade-in">
                       <div className="mb-4"><h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.delSelectComponentsTitle}</h3><p className="text-gray-500 dark:text-gray-400 text-sm">{t.delSelectComponentsDesc}</p></div>
                       <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                           <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" onChange={toggleSelectAll} className="w-5 h-5 rounded border-gray-300 text-blue-600" /><span className="font-bold text-gray-800 dark:text-white">{t.selectAllComponents}</span></label>
                       </div>
                       <div className="space-y-3">
                           {components.map(c => (
                               <div key={c.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                                   <div className="flex items-center gap-4">
                                       <div className={`w-12 h-12 rounded-lg bg-${c.color}-50 dark:bg-${c.color}-900/30 text-${c.color}-600 dark:text-${c.color}-400 flex items-center justify-center`}><c.icon size={24} /></div>
                                       <div><h4 className="font-bold text-gray-800 dark:text-white">{c.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.desc}</p></div>
                                   </div>
                                   <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer"><input type="checkbox" checked={(selection as any)[c.id]} onChange={(e) => setSelection({...selection, [c.id]: e.target.checked})} className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 transition-all" /><Check size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" /></label>
                               </div>
                           ))}
                       </div>
                       <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl p-5 mt-6">
                           <div className="flex items-center gap-2 mb-4 text-red-600 font-bold"><Skull size={20} /><span>{t.dangerZone}</span></div>
                           <div className="space-y-3">
                               <label className="flex items-start gap-3 cursor-pointer group"><input type="checkbox" checked={selection.backups} onChange={(e) => setSelection({...selection, backups: e.target.checked})} className="w-5 h-5 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500" /><span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-300">{t.deleteBackups}</span></label>
                               <label className="flex items-start gap-3 cursor-pointer group"><input type="checkbox" checked={selection.logs} onChange={(e) => setSelection({...selection, logs: e.target.checked})} className="w-5 h-5 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500" /><span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-300">{t.deleteLogs}</span></label>
                           </div>
                           <div className="flex items-center gap-2 mt-4 text-xs text-red-500 font-medium"><AlertCircle size={14} />{t.dangerActionWarning}</div>
                       </div>
                  </div>
              );
          case 3: // 步骤 3: 二次确认 (输入名称)
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="mb-4"><h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.delFinalConfirmTitle}</h3><p className="text-gray-500 dark:text-gray-400 text-sm">{t.delFinalConfirmSubtitle}</p></div>
                      <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl p-6">
                           <div className="flex items-center gap-2 mb-4 text-red-600 font-bold text-lg"><AlertTriangle size={24} className="fill-red-100" /><span>{t.delFinalWarningTitle}</span></div>
                           <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{t.delFinalWarningDesc.replace('{name}', '')} <span className="font-bold bg-red-100 dark:bg-red-900/40 px-1 rounded mx-1">{project.name}</span></p>
                           <div className="mb-4"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.delInputLabel}</label><input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all dark:bg-gray-800 dark:text-white" placeholder={t.delInputPlaceholder}/></div>
                           <label className="flex items-start gap-3 cursor-pointer select-none"><input type="checkbox" checked={finalCheck} onChange={(e) => setFinalCheck(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-gray-400 text-red-600 focus:ring-red-500 bg-white" /><span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{t.delCheckboxLabel}</span></label>
                      </div>
                  </div>
              );
          case 4: // 步骤 4: 删除中进度条
               return (
                   <div className="space-y-8 animate-fade-in py-8">
                       <div className="text-center">
                           <div className="relative w-24 h-24 mx-auto mb-6">
                               <svg className="w-full h-full" viewBox="0 0 100 100"><circle className="text-gray-200 dark:text-gray-700 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle><circle className="text-red-500 progress-ring__circle stroke-current transition-all duration-300 ease-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progress) / 100} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}></circle></svg>
                               <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-red-600">{progress}%</div>
                           </div>
                           <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleting}</h3>
                           <p className="text-gray-500 dark:text-gray-400">Cleaning up resources...</p>
                       </div>
                   </div>
               );
          default: return null;
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-red-500 p-8 text-white relative flex-shrink-0">
                <h2 className="text-2xl font-bold mb-2">{t.deleteProjectTitle}</h2>
                <p className="opacity-90 text-sm">{t.deleteProjectSubtitle}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative py-6">
                {/* 步骤条 */}
                <div className="max-w-3xl mx-auto px-6 relative">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="absolute top-4 left-6 h-0.5 bg-red-500 transition-all duration-300" style={{ width: `calc(${((step - 1) / 3) * 100}% - 48px)` }}></div>
                    <div className="flex justify-between relative">
                       {[1, 2, 3, 4].map(s => (
                           <div key={s} className="flex flex-col items-center gap-2 z-10">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${s <= step ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>{s < step ? <Check size={16} /> : s}</div>
                               <span className={`text-xs font-medium ${s <= step ? 'text-red-500' : 'text-gray-400'}`}>{t[`delStep${s}` as keyof typeof t]}</span>
                           </div>
                       ))}
                    </div>
                </div>
            </div>
            
            {/* 内容区域 - 隐藏滚动条但保留滚动功能 (模拟虚拟滚动体验) */}
            <div className="p-8 overflow-y-auto bg-white dark:bg-gray-900 flex-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                 <div className="max-w-3xl mx-auto">{renderContent()}</div>
            </div>
            
            {/* 底部按钮 */}
            {step < 4 && !loadingInfo && (
                 <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
                    <div>{step > 1 && <button onClick={() => setStep(prev => prev - 1)} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"><ArrowLeft size={16} /> {t.prev}</button>}</div>
                    <div className="flex gap-4">
                       <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">{t.cancel}</button>
                       {step < 3 ? <button onClick={() => setStep(prev => prev + 1)} className="px-8 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 font-medium flex items-center gap-2">{t.next} <ChevronRight size={16} /></button>
                       : <button onClick={executeDelete} disabled={confirmName !== project.name || !finalCheck} className="px-8 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16} /> {t.delete}</button>}
                    </div>
                 </div>
            )}
        </div>
    </div>
  );
};

export default DeleteWizard;