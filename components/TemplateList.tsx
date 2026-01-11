import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Search, 
  Trash2, 
  Eye, 
  Rocket, 
  Users, 
  Clock, 
  Tag, 
  Loader2,
  Check,
  Edit,
  Save,
  X
} from 'lucide-react';
import { LOCALE } from '../constants';
import { Language } from '../types';
import { getTemplates, updateTemplate, deleteTemplate } from '../services/mockService';

interface TemplateListProps {
  lang: Language;
}

const TemplateList: React.FC<TemplateListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [activeTab, setActiveTab] = useState<'gallery' | 'my'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    desc: '', 
    category: '', 
    tags: '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tpl.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'gallery' ? tpl.type === 'official' : tpl.type === 'custom';
    return matchesSearch && matchesTab;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (tpl: any) => {
    setCurrentTemplate(tpl);
    setFormData({
        name: tpl.name,
        desc: tpl.desc,
        category: tpl.category,
        tags: tpl.tags.join(', ')
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentTemplate || !formData.name) return;
    setIsSaving(true);
    try {
        const updatedData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        await updateTemplate(currentTemplate.id, updatedData);
        setTemplates(prev => prev.map(t => 
            t.id === currentTemplate.id ? { ...t, ...updatedData } : t
        ));
        setIsEditModalOpen(false);
    } catch (err) {
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    return t[cat as keyof typeof t] || cat;
  };

  const categories = [
      { id: 'catEnterprise', label: t.catEnterprise },
      { id: 'catECommerce', label: t.catECommerce },
      { id: 'catGeneral', label: t.catGeneral },
      { id: 'catData', label: t.catData },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <LayoutTemplate className="text-nebula-500" />
             {t.templates}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
             {activeTab === 'gallery' ? t.selectTemplateDesc : 'Manage your custom project templates.'}
           </p>
        </div>
      </div>

      {/* Tabs & Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
         {/* Tabs */}
         <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start md:self-auto">
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'gallery' 
                ? 'bg-white dark:bg-gray-700 text-nebula-600 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.templateGallery}
            </button>
            <button 
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'my' 
                ? 'bg-white dark:bg-gray-700 text-nebula-600 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.myTemplates}
            </button>
         </div>

         {/* Search */}
         <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder={t.searchTemplates}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
             />
         </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-nebula-500" size={32} />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <LayoutTemplate className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noTemplatesFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredTemplates.map(tpl => (
              <div key={tpl.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                 {/* Card Header / Image */}
                 <div className={`h-32 ${tpl.color} relative p-6 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                       <span className="bg-black/20 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
                          {getCategoryLabel(tpl.category)}
                       </span>
                       {activeTab === 'my' && (
                          <div className="flex gap-2">
                             <button 
                               onClick={() => openEditModal(tpl)}
                               className="p-1.5 bg-black/20 hover:bg-black/40 text-white rounded transition-colors"
                             >
                                <Edit size={16} />
                             </button>
                             <div className="relative">
                                {deleteConfirmId === tpl.id ? (
                                   <div className="absolute right-0 top-0 flex items-center bg-white dark:bg-gray-800 p-1 rounded shadow-lg animate-fade-in">
                                      <button onClick={() => handleDelete(tpl.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Check size={16}/></button>
                                      <button onClick={() => setDeleteConfirmId(null)} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><span className="text-xs font-bold">X</span></button>
                                   </div>
                                ) : (
                                   <button 
                                     onClick={() => setDeleteConfirmId(tpl.id)}
                                     className="p-1.5 bg-black/20 hover:bg-black/40 text-white rounded transition-colors"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                )}
                             </div>
                          </div>
                       )}
                    </div>
                    <h3 className="text-xl font-bold text-white shadow-sm">{tpl.name}</h3>
                 </div>

                 {/* Card Body */}
                 <div className="p-5 flex flex-col h-[calc(100%-8rem)]">
                    <div className="flex flex-wrap gap-2 mb-3">
                       {tpl.tags.map((tag: string) => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded flex items-center gap-1">
                             <Tag size={10} /> {tag}
                          </span>
                       ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                       {tpl.desc}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3 mt-auto">
                       <span className="flex items-center gap-1"><Users size={12}/> {tpl.usageCount} {t.templateUsage}</span>
                       <span className="flex items-center gap-1"><Clock size={12}/> {tpl.author}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                       <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
                          <Eye size={16} /> {t.previewTemplate}
                       </button>
                       <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-nebula-600 hover:bg-nebula-700 text-white transition-colors text-sm font-medium shadow-md shadow-nebula-600/20">
                          <Rocket size={16} /> {t.useTemplate}
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t.editTemplate}
                 </h2>
                 <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.templateName} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.templateCategory}</label>
                    <div className="relative">
                        <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                        >
                           {categories.map(cat => (
                               <option key={cat.id} value={cat.id}>{cat.label}</option>
                           ))}
                        </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.templateTags}</label>
                    <input 
                      type="text" 
                      value={formData.tags} 
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      placeholder={t.templateTagsPlaceholder}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.templateDesc}</label>
                    <textarea 
                      value={formData.desc} 
                      onChange={e => setFormData({...formData, desc: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none h-24 resize-none"
                    />
                 </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                 <button onClick={() => setIsEditModalOpen(false)} disabled={isSaving} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                    {t.cancel}
                 </button>
                 <button onClick={handleUpdate} disabled={isSaving} className="px-6 py-2 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 font-medium flex items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {t.save}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default TemplateList;