
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2,
  X,
  Save,
  Filter,
  Image as ImageIcon,
  Code as CodeIcon,
  ChevronRight,
  Wrench,
  FolderCog,
  Upload,
  Check
} from 'lucide-react';
import { LOCALE, RESOURCE_TYPES } from '../constants';
import { Language, Resource, ResourceType } from '../types';
import { getResources, createResource, updateResource, deleteResource } from '../services/mockService';
import RichTextEditor from './common/RichTextEditor';

interface ResourceListProps {
  lang: Language;
}

const ResourceList: React.FC<ResourceListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeType, setActiveType] = useState<ResourceType>('page_template');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [extraGroups, setExtraGroups] = useState<string[]>([]); // Track newly added empty groups

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Group Management State
  const [isGroupMgrOpen, setIsGroupMgrOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupValue, setEditGroupValue] = useState('');
  const [newGroupValue, setNewGroupValue] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<Resource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const initialFormState: Partial<Resource> = {
    name: '',
    code: '',
    group: '',
    description: '',
    previewUrl: '',
    type: 'page_template',
    appType: 'Web'
  };
  const [formData, setFormData] = useState<Partial<Resource>>(initialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesType = res.type === activeType;
      const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            res.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = groupFilter === 'All' || res.group === groupFilter;
      return matchesType && matchesSearch && matchesGroup;
    });
  }, [resources, activeType, searchTerm, groupFilter]);

  // Extract unique groups for the current type, plus extra groups
  const availableGroups = useMemo(() => {
    const typeResources = resources.filter(r => r.type === activeType);
    const groups = new Set([...typeResources.map(r => r.group).filter(Boolean), ...extraGroups]);
    return ['All', ...Array.from(groups)];
  }, [resources, activeType, extraGroups]);

  // Group stats for manager
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Initialize with extraGroups
    extraGroups.forEach(g => counts[g] = 0);
    // Count resources
    resources.filter(r => r.type === activeType).forEach(r => {
        if (r.group) {
            counts[r.group] = (counts[r.group] || 0) + 1;
        }
    });
    return counts;
  }, [resources, activeType, extraGroups]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ ...initialFormState, type: activeType });
    setIsModalOpen(true);
  };

  const openEditModal = (res: Resource) => {
    setModalMode('edit');
    setCurrentResource(res);
    setFormData({ ...res });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (res: Resource) => {
    setResToDelete(res);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) return;
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        await createResource(formData);
        const newRes: Resource = {
          id: `res_${Date.now()}`,
          name: formData.name!,
          code: formData.code!,
          type: formData.type as ResourceType,
          group: formData.group || 'General',
          previewUrl: formData.previewUrl || '',
          description: formData.description || '',
          appType: formData.appType,
          author: 'Admin',
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setResources([...resources, newRes]);
      } else if (modalMode === 'edit' && currentResource) {
        await updateResource(currentResource.id, formData);
        setResources(prev => prev.map(r => r.id === currentResource.id ? { ...r, ...formData } as Resource : r));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!resToDelete) return;
    setIsDeleting(true);
    try {
      await deleteResource(resToDelete.id);
      setResources(prev => prev.filter(r => r.id !== resToDelete.id));
      setDeleteConfirmOpen(false);
      setResToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Image Upload Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate upload by using base64 directly
        setFormData({ ...formData, previewUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // --- Group Management Logic ---
  const handleAddGroup = () => {
      if (newGroupValue.trim()) {
          setExtraGroups(prev => [...prev, newGroupValue.trim()]);
          setNewGroupValue('');
      }
  };

  const startEditGroup = (group: string) => {
      setEditingGroup(group);
      setEditGroupValue(group);
  };

  const handleUpdateGroup = () => {
      if (editingGroup && editGroupValue.trim() && editingGroup !== editGroupValue) {
          // Update all resources with this group
          setResources(prev => prev.map(r => 
              (r.type === activeType && r.group === editingGroup) 
              ? { ...r, group: editGroupValue } 
              : r
          ));
          // Update extraGroups list if it was there
          setExtraGroups(prev => prev.map(g => g === editingGroup ? editGroupValue : g));
      }
      setEditingGroup(null);
      setEditGroupValue('');
  };

  const handleDeleteGroup = (group: string) => {
      const confirmMsg = t.confirmDeleteGroup;
      if (window.confirm(confirmMsg)) {
          // Move resources to 'General'
          setResources(prev => prev.map(r => 
              (r.type === activeType && r.group === group) 
              ? { ...r, group: 'General' } 
              : r
          ));
          // Remove from extraGroups
          setExtraGroups(prev => prev.filter(g => g !== group));
      }
  };

  const hasPreviewField = (type: string | undefined) => {
    return ['page_template', 'biz_component', 'pro_component', 'vue_component'].includes(type || '');
  };

  const hasAppTypeField = (type: string | undefined) => {
      return ['page_template', 'biz_component', 'pro_component'].includes(type || '');
  }

  // Get options for App Type based on Resource Type
  const getAppTypeOptions = () => {
      if (formData.type === 'page_template') {
          return ['Web', 'App'];
      }
      return ['Web', 'App', 'Backend'];
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] animate-fade-in gap-6">
      
      {/* Sidebar - Types */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200">
            {t.resources}
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {RESOURCE_TYPES.map(type => {
               const isActive = activeType === type.id;
               return (
                  <button
                    key={type.id}
                    onClick={() => {
                        setActiveType(type.id as ResourceType);
                        setGroupFilter('All');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                       isActive 
                       ? 'bg-nebula-50 text-nebula-700 dark:bg-nebula-900/30 dark:text-nebula-400' 
                       : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                     <div className="flex items-center gap-3">
                        <type.icon size={18} />
                        {t[type.labelKey as keyof typeof t]}
                     </div>
                     {isActive && <ChevronRight size={14} />}
                  </button>
               )
            })}
         </div>
         
         {/* Manage Groups Button at Bottom */}
         <div className="p-3 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <button 
                onClick={() => setIsGroupMgrOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <FolderCog size={16} />
                {t.resManageGroups}
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
         
         {/* Header / Toolbar */}
         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder={t.searchResources}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                  />
               </div>
               
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Filter size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none min-w-[120px]"
                  >
                     {availableGroups.map(g => (
                        <option key={g} value={g}>{g}</option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
               <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <ListIcon size={16} />
                  </button>
               </div>
               
               <button 
                 onClick={openCreateModal}
                 className="flex items-center gap-2 bg-nebula-600 hover:bg-nebula-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
               >
                 <Plus size={16} />
                 {t.createResource}
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
            {loading ? (
               <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-nebula-500" size={32} />
               </div>
            ) : filteredResources.length === 0 ? (
               <div className="flex flex-col justify-center items-center h-full text-gray-400">
                  <Wrench size={48} className="mb-4 opacity-20" />
                  <p>{t.noResourcesFound}</p>
               </div>
            ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResources.map(res => (
                     <div key={res.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 relative">
                        {/* Preview Area */}
                        <div className="h-32 bg-gray-100 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                           {res.previewUrl ? (
                              <img src={res.previewUrl} alt={res.name} className="w-full h-full object-cover" />
                           ) : (
                              <div className="text-gray-300 dark:text-gray-600">
                                 {hasPreviewField(res.type) ? <ImageIcon size={32} /> : <CodeIcon size={32} />}
                              </div>
                           )}
                           
                           {/* Category Tag */}
                           <div className="absolute top-2 left-2 flex gap-1">
                               <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
                                  {res.group}
                               </div>
                               {res.appType && (
                                   <div className="bg-nebula-600/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
                                       {t[`appType${res.appType}` as keyof typeof t]}
                                   </div>
                               )}
                           </div>

                           {/* Actions Dropdown (Safe Bridge) */}
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="relative group/menu">
                                 <button className="p-1 bg-white/90 dark:bg-black/50 hover:bg-white text-gray-600 dark:text-gray-300 rounded shadow-sm">
                                    <MoreVertical size={16} />
                                 </button>
                                 <div className="absolute right-0 top-full pt-2 w-32 hidden group-hover/menu:block z-20">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1">
                                       <button onClick={() => openEditModal(res)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                          <Edit size={14} /> {t.edit}
                                       </button>
                                       <button onClick={() => handleDeleteClick(res)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                          <Trash2 size={14} /> {t.delete}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Details */}
                        <div className="p-4">
                           <h3 className="font-bold text-gray-800 dark:text-white truncate" title={res.name}>{res.name}</h3>
                           <p className="text-xs text-gray-500 font-mono mb-2 truncate">{res.code}</p>
                           <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10 mb-3" dangerouslySetInnerHTML={{ __html: res.description }}></p>
                           
                           <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <span>{res.author}</span>
                              <span>{res.updatedAt}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                        <tr>
                           <th className="px-6 py-4">{t.resName}</th>
                           <th className="px-6 py-4">{t.resCode}</th>
                           <th className="px-6 py-4">{t.resGroup}</th>
                           <th className="px-6 py-4">{t.resAppType}</th>
                           <th className="px-6 py-4">{t.resUpdated}</th>
                           <th className="px-6 py-4 text-right">{t.actions}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredResources.map(res => (
                           <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="font-medium text-gray-900 dark:text-white">{res.name}</div>
                                 <div className="text-xs text-gray-500 truncate max-w-xs">{res.description.replace(/<[^>]+>/g, '')}</div>
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-500">{res.code}</td>
                              <td className="px-6 py-4">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    {res.group}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 {res.appType ? (
                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-nebula-50 dark:bg-nebula-900/30 text-nebula-700 dark:text-nebula-400">
                                        {t[`appType${res.appType}` as keyof typeof t]}
                                     </span>
                                 ) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{res.updatedAt}</td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openEditModal(res)} className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 transition-colors">
                                       <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(res)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>

      {/* Group Management Modal */}
      {isGroupMgrOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
               <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     <FolderCog size={18} />
                     {t.resGroupMgmtTitle}
                  </h2>
                  <button onClick={() => setIsGroupMgrOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="p-5 space-y-4">
                  {/* Add Group */}
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={newGroupValue}
                       onChange={(e) => setNewGroupValue(e.target.value)}
                       placeholder={t.resGroupPlaceholder}
                       className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                     />
                     <button 
                       onClick={handleAddGroup}
                       disabled={!newGroupValue.trim()}
                       className="px-4 py-2 bg-nebula-600 text-white rounded-lg text-sm font-medium hover:bg-nebula-700 disabled:opacity-50"
                     >
                       <Plus size={18} />
                     </button>
                  </div>

                  {/* Group List */}
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                     {Object.entries(groupCounts).map(([group, count]) => (
                        <div key={group} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                           {editingGroup === group ? (
                              <div className="flex items-center gap-2 flex-1 mr-2">
                                 <input 
                                   type="text" 
                                   value={editGroupValue}
                                   onChange={(e) => setEditGroupValue(e.target.value)}
                                   className="w-full px-2 py-1 text-sm rounded border border-nebula-300 focus:ring-1 focus:ring-nebula-500 outline-none"
                                   autoFocus
                                 />
                                 <button onClick={handleUpdateGroup} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                                 <button onClick={() => setEditingGroup(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={16} /></button>
                              </div>
                           ) : (
                              <div className="flex items-center gap-3">
                                 <span className="font-medium text-gray-800 dark:text-white text-sm">{group}</span>
                                 <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{count}</span>
                              </div>
                           )}
                           
                           {editingGroup !== group && (
                              <div className="flex items-center gap-1">
                                 <button onClick={() => startEditGroup(group)} className="p-1.5 text-gray-400 hover:text-nebula-600 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
                                    <Edit size={14} />
                                 </button>
                                 <button onClick={() => handleDeleteGroup(group)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {modalMode === 'create' ? t.createResource : t.editResource}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.resName} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder={t.enterResName}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.resCode} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      placeholder={t.enterResCode}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.resGroup}</label>
                        <div className="relative">
                           <input 
                             type="text" 
                             value={formData.group} 
                             onChange={e => setFormData({...formData, group: e.target.value})}
                             placeholder={t.enterResGroup}
                             list="group-options"
                             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                           />
                           <datalist id="group-options">
                              {Object.keys(groupCounts).map(g => (
                                 <option key={g} value={g} />
                              ))}
                           </datalist>
                        </div>
                     </div>

                     {/* App Type Selection (Conditional) */}
                     {hasAppTypeField(formData.type) && (
                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.resAppType}</label>
                            <select
                                value={formData.appType || 'Web'}
                                onChange={e => setFormData({...formData, appType: e.target.value as any})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                            >
                                {getAppTypeOptions().map(opt => (
                                    <option key={opt} value={opt}>{t[`appType${opt}` as keyof typeof t]}</option>
                                ))}
                            </select>
                         </div>
                     )}
                 </div>

                 {hasPreviewField(formData.type) && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.resPreview}</label>
                        
                        <div 
                           onClick={triggerFileUpload}
                           className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-nebula-500 dark:hover:border-nebula-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative overflow-hidden group"
                        >
                           {formData.previewUrl ? (
                               <div className="relative w-full h-full">
                                   <img src={formData.previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Upload className="text-white" size={24} />
                                   </div>
                               </div>
                           ) : (
                               <>
                                   <Upload className="text-gray-400 mb-2" size={24} />
                                   <span className="text-sm text-gray-500 dark:text-gray-400">{t.uploadPreview}</span>
                                   <span className="text-xs text-gray-400 mt-1">{t.uploadPreviewHint}</span>
                               </>
                           )}
                           <input 
                             type="file" 
                             ref={fileInputRef} 
                             onChange={handleFileChange} 
                             accept="image/png, image/jpeg, image/webp" 
                             className="hidden" 
                           />
                        </div>
                    </div>
                 )}

                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.resDesc}</label>
                    <RichTextEditor 
                      value={formData.description || ''} 
                      onChange={val => setFormData({...formData, description: val})} 
                      placeholder={t.richTextPlaceholder}
                    />
                 </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                 <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                    {t.cancel}
                 </button>
                 <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 font-medium flex items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {t.save}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && resToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleteResource}</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">{t.confirmDeleteRes}</p>
               <div className="flex justify-center gap-3">
                  <button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                     {t.cancel}
                  </button>
                  <button onClick={executeDelete} disabled={isDeleting} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium flex items-center gap-2">
                     {isDeleting && <Loader2 className="animate-spin" size={16} />}
                     {t.delete}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default ResourceList;
