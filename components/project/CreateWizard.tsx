
import React, { useState } from 'react';
import { 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  Rocket, 
  Database, 
  Server, 
  HardDrive, 
  PlayCircle,
  Loader2,
  Cloud
} from 'lucide-react';
import { LOCALE, MOCK_TEMPLATES } from '../../constants';
import { Language } from '../../types';
import { createProject } from '../../services/mockService';

interface CreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProject: any) => void;
  lang: Language;
}

/**
 * 项目创建向导 (CreateWizard)
 * 包含 4 个步骤：基础信息 -> 模板选择 -> 数据库配置 -> 确认信息
 */
const CreateWizard: React.FC<CreateWizardProps> = ({ isOpen, onClose, onSuccess, lang }) => {
  const t = LOCALE[lang];
  const [step, setStep] = useState(1); // 当前步骤
  const [isCreating, setIsCreating] = useState(false); // 提交加载状态
  
  // 表单数据状态
  const [data, setData] = useState({
    name: '',
    projectNumber: '',
    desc: '',
    templateId: 'blank', // 默认为空白模板
    dbType: 'mysql',
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: '',
    dbUser: '',
    dbPassword: '',
    dbTestConnection: false
  });

  if (!isOpen) return null;

  // 数据库类型配置
  const dbTypes = [
    { id: 'nebula', label: '星云', icon: Cloud, defaultPort: '' },
    { id: 'mysql', label: 'MySQL', icon: Database, defaultPort: '3306' },
    { id: 'postgresql', label: 'PostgreSQL', icon: Server, defaultPort: '5432' },
    { id: 'oracle', label: 'Oracle', icon: PlayCircle, defaultPort: '1521' },
    { id: 'dameng', label: 'Dameng', icon: HardDrive, defaultPort: '5236' },
    { id: 'kingbase', label: 'Kingbase', icon: Check, defaultPort: '54321' },
  ];

  // 切换数据库类型时自动更新默认端口
  const handleDbTypeSelect = (typeId: string, defaultPort: string) => {
    setData(prev => ({ ...prev, dbType: typeId, dbPort: defaultPort }));
  };

  // 提交创建请求
  const handleCreate = async () => {
    // 简单校验
    if (!data.name.trim()) {
        alert(t.namePlaceholder);
        return;
    }
    setIsCreating(true);
    try {
        await createProject(data);
        // 构造新项目对象（模拟后端返回）
        const newProject = {
            id: Date.now(),
            name: data.name,
            number: data.projectNumber,
            desc: data.desc || 'No description',
            status: 'In Progress',
            lastEdited: 'Just now',
            color: 'bg-nebula-500',
            size: '0 MB',
            created: new Date().toISOString().split('T')[0]
        };
        onSuccess(newProject);
        onClose();
    } catch (error) {
        console.error("Failed to create", error);
        alert("Failed to create project");
    } finally {
        setIsCreating(false);
    }
  };

  // 根据步骤渲染内容
  const renderContent = () => {
    switch(step) {
      case 1: // 步骤 1: 基础信息
        return (
          <div className="space-y-6 animate-fade-in px-2">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.step1}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">请输入项目的基本信息。</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectName} <span className="text-red-500">*</span></label>
                  <input type="text" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" placeholder={t.namePlaceholder} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectNumber} <span className="text-red-500">*</span></label>
                  <input type="text" value={data.projectNumber} onChange={(e) => setData({...data, projectNumber: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" placeholder={t.projectNumberPlaceholder} />
                </div>
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectDesc}</label>
               <textarea value={data.desc} onChange={(e) => setData({...data, desc: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white h-32 resize-none" placeholder={t.descPlaceholder} />
             </div>
          </div>
        );
      case 2: // 步骤 2: 模板选择
        return (
          <div className="space-y-8 animate-fade-in px-2 py-4">
             <div className="text-left mb-6">
               <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t.selectTemplateTitle}</h3>
               <p className="text-gray-500 dark:text-gray-400">{t.selectTemplateDesc}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_TEMPLATES.map(tpl => (
                  <div key={tpl.id} onClick={() => setData({...data, templateId: tpl.id})} className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center group h-full ${data.templateId === tpl.id ? 'border-nebula-500 bg-nebula-50/50 dark:bg-nebula-900/20 shadow-md ring-1 ring-nebula-500' : 'border-gray-200 dark:border-gray-700 hover:border-nebula-400 dark:hover:border-nebula-500 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-800'}`}>
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-colors ${data.templateId === tpl.id ? 'bg-nebula-600 text-white' : 'bg-blue-50 dark:bg-gray-700 text-nebula-600 dark:text-nebula-400 group-hover:bg-nebula-600 group-hover:text-white'}`}><tpl.icon size={32} /></div>
                    <h4 className={`font-bold text-lg mb-3 ${data.templateId === tpl.id ? 'text-nebula-700 dark:text-nebula-300' : 'text-gray-800 dark:text-white'}`}>{t[tpl.nameKey as keyof typeof t]}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">{t[tpl.descKey as keyof typeof t]}</p>
                    {data.templateId === tpl.id && <div className="absolute top-4 right-4 text-nebula-600 dark:text-nebula-400"><Check size={20} className="bg-white dark:bg-gray-800 rounded-full p-0.5" /></div>}
                  </div>
                ))}
             </div>
          </div>
        );
      case 3: // 步骤 3: 数据库配置
        const isNebula = data.dbType === 'nebula';
        return (
          <div className="space-y-8 animate-fade-in px-2 py-4">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.dbConfigTitle}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">{t.dbConfigDesc}</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {dbTypes.map((type) => (
                 <div key={type.id} onClick={() => handleDbTypeSelect(type.id, type.defaultPort)} className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-2 transition-all h-24 ${data.dbType === type.id ? 'border-nebula-500 bg-nebula-50 dark:bg-nebula-900/20 text-nebula-700 dark:text-nebula-300' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-nebula-300'}`}>
                   <type.icon size={24} className={data.dbType === type.id ? 'text-nebula-600' : 'text-gray-400'} />
                   <span className="font-bold text-xs">{type.label}</span>
                 </div>
               ))}
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbHost}</label>
                 <input 
                   type="text" 
                   value={data.dbHost} 
                   onChange={(e) => setData({...data, dbHost: e.target.value})} 
                   disabled={isNebula}
                   className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors ${isNebula ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'}`}
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbPort}</label>
                 <input 
                   type="text" 
                   value={data.dbPort} 
                   onChange={(e) => setData({...data, dbPort: e.target.value})} 
                   disabled={isNebula}
                   className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors ${isNebula ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'}`}
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbName}</label>
                 <input 
                   type="text" 
                   value={data.dbName} 
                   onChange={(e) => setData({...data, dbName: e.target.value})} 
                   disabled={isNebula}
                   className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors ${isNebula ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'}`}
                   placeholder={isNebula ? '' : t.dbNamePlaceholder}
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbUser}</label>
                 <input 
                   type="text" 
                   value={data.dbUser} 
                   onChange={(e) => setData({...data, dbUser: e.target.value})} 
                   disabled={isNebula}
                   className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors ${isNebula ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'}`}
                   placeholder={isNebula ? '' : t.dbUserPlaceholder}
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbPassword}</label>
                 <input 
                   type="password" 
                   value={data.dbPassword} 
                   onChange={(e) => setData({...data, dbPassword: e.target.value})} 
                   disabled={isNebula}
                   className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors ${isNebula ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'}`}
                   placeholder={isNebula ? '' : t.dbPasswordPlaceholder}
                 />
               </div>
             </div>
          </div>
        );
      case 4: // 步骤 4: 确认信息
        const selectedTpl = MOCK_TEMPLATES.find(t => t.id === data.templateId);
        return (
          <div className="space-y-6 animate-fade-in px-2">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.step4}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">请核对以下信息，确认无误后点击创建。</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.projectName}</span><span className="font-medium text-gray-800 dark:text-white">{data.name}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.projectNumber}</span><span className="font-medium text-gray-800 dark:text-white">{data.projectNumber}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.selectTemplate}</span><span className="font-medium text-gray-800 dark:text-white flex items-center gap-1">{selectedTpl && <selectedTpl.icon size={14} />}{selectedTpl ? t[selectedTpl.nameKey as keyof typeof t] : '-'}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.dbType}</span><span className="font-medium text-gray-800 dark:text-white uppercase">{data.dbType === 'nebula' ? '星云' : data.dbType}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.dbHost}</span><span className="font-medium text-gray-800 dark:text-white">{data.dbType === 'nebula' ? 'Managed' : `${data.dbHost}:${data.dbPort}`}</span></div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-nebula-600 p-8 text-white relative flex-shrink-0">
           <h2 className="text-2xl font-bold mb-2">{t.createProjectTitle}</h2>
           <p className="opacity-80 text-sm">{t.createProjectSubtitle}</p>
        </div>
        
        {/* Progress Stepper */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-4 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
              <div className="absolute left-0 top-4 h-0.5 bg-nebula-600 dark:bg-nebula-400 transition-all duration-300 -z-0" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
              {[1, 2, 3, 4].map(s => {
                const isCompleted = s < step;
                const isCurrent = s === step;
                return (
                   <div key={s} onClick={() => !isCreating && s < step && setStep(s)} className={`relative z-10 flex flex-col items-center gap-2 group ${s < step && !isCreating ? 'cursor-pointer' : 'cursor-default'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${isCompleted ? 'bg-nebula-600 border-nebula-600 text-white' : isCurrent ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                        {isCompleted ? <Check size={16} /> : s}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${isCompleted ? 'text-nebula-600 dark:text-nebula-400' : isCurrent ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-400'}`}>{t[`step${s}` as keyof typeof t]}</span>
                   </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           <div className="max-w-4xl mx-auto">{renderContent()}</div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
           <div>{step > 1 && <button onClick={() => setStep(prev => prev - 1)} disabled={isCreating} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"><ArrowLeft size={16} /> {t.prev}</button>}</div>
           <div className="flex gap-4">
             <button onClick={onClose} disabled={isCreating} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50">{t.cancel}</button>
             {step < 4 ? <button onClick={() => setStep(prev => prev + 1)} className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-50" disabled={(step === 1 && (!data.name || !data.projectNumber)) || (step === 3 && data.dbType !== 'nebula' && !data.dbHost)}>{t.next} <ChevronRight size={16} /></button>
             : <button onClick={handleCreate} disabled={isCreating} className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-70">{isCreating ? <><Loader2 className="animate-spin" size={18} /> {t.loading}</> : <><Rocket size={18} /> {t.create}</>}</button>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWizard;
