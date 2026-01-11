import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, ChevronDown, Check } from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language } from '../../types';
import { getProjectMembers, updateProject } from '../../services/mockService';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  lang: Language;
  onUpdate: (updatedProject: any) => void;
}

/**
 * 编辑项目弹窗 (EditModal)
 * 允许用户修改项目名称、编号、描述、状态及成员配置。
 */
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, project, lang, onUpdate }) => {
  const t = LOCALE[lang];
  const [data, setData] = useState({ ...project });
  const [isSaving, setIsSaving] = useState(false);
  
  // 成员管理状态
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // 初始化：获取最新成员列表并设置初始值
  useEffect(() => {
    if (isOpen) {
        setData({ ...project });
        setLoadingMembers(true);
        getProjectMembers().then(m => {
            setMembers(m);
            setLoadingMembers(false);
            // 模拟默认选中的成员
            setSelectedMemberIds([101, 102]);
        });
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  // 保存修改
  const handleSave = async () => {
      if (!data.name.trim()) return alert(t.namePlaceholder);
      setIsSaving(true);
      try {
          const updated = { ...data, memberIds: selectedMemberIds };
          await updateProject(project.id, updated);
          onUpdate(updated);
          onClose();
      } catch(e) {
          console.error(e);
      } finally {
          setIsSaving(false);
      }
  };

  // 切换成员选中状态
  const toggleMember = (id: number) => {
      setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
       <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
         {/* 顶部标题栏 */}
         <div className="bg-gradient-to-r from-purple-600 to-nebula-600 p-6 text-white relative flex-shrink-0 flex justify-between items-center">
            <div><h2 className="text-xl font-bold mb-1">{t.editProjectTitle}</h2><p className="opacity-80 text-sm">{t.editProjectSubtitle}</p></div>
            <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><X size={20} /></button>
         </div>
         
         {/* 表单内容区 */}
         <div className="p-8 overflow-y-auto bg-white dark:bg-gray-900">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectName} <span className="text-red-500">*</span></label><input type="text" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectNumber} <span className="text-red-500">*</span></label><input type="text" value={data.number || ''} onChange={(e) => setData({...data, number: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" /></div>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectDesc}</label><textarea value={data.desc} onChange={(e) => setData({...data, desc: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white h-24 resize-none" /></div>
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.status}</label><div className="relative"><select value={data.status} onChange={(e) => setData({...data, status: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white appearance-none"><option value="In Progress">In Progress</option><option value="Closed">Closed</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} /></div></div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between"><span>{t.projectMembers}</span><span className="text-xs font-normal text-nebula-600 dark:text-nebula-400 cursor-pointer hover:underline">{t.manageMembers}</span></label>
                   <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[200px] overflow-y-auto">
                      {loadingMembers ? <div className="flex items-center justify-center py-8 text-gray-500"><Loader2 className="animate-spin mr-2" size={16} />{t.loadingMembers}</div> : (
                         <div className="space-y-2">{members.map(member => (<div key={member.id} onClick={() => toggleMember(member.id)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${selectedMemberIds.includes(member.id) ? 'bg-nebula-50 dark:bg-nebula-900/20 border-nebula-200 dark:border-nebula-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}><div className="flex items-center gap-3"><img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full bg-gray-200" /><div><p className="text-sm font-bold text-gray-800 dark:text-white">{member.name}</p><p className="text-xs text-gray-500">{member.role}</p></div></div><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMemberIds.includes(member.id) ? 'bg-nebula-600 border-nebula-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>{selectedMemberIds.includes(member.id) && <Check size={12} />}</div></div>))}</div>
                      )}
                   </div>
                </div>
            </div>
         </div>
         
         {/* 底部按钮栏 */}
         <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-end gap-4 flex-shrink-0">
              <button onClick={onClose} disabled={isSaving} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50">{t.cancel}</button>
              <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">{isSaving ? <><Loader2 className="animate-spin" size={18} />{t.saving}</> : <><Save size={18} />{t.saveChanges}</>}</button>
         </div>
       </div>
     </div>
  );
};

export default EditModal;