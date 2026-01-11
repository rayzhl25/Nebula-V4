import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Users, 
  Loader2,
  X,
  Save,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  User as UserIcon,
  Briefcase,
  ChevronDown,
  Check
} from 'lucide-react';
import { LOCALE, AVATAR_LIST } from '../constants';
import { Language, Developer, Department } from '../types';
import { 
  getDevelopers, 
  createDeveloper, 
  updateDeveloper, 
  deleteDeveloper, 
  getDepartments 
} from '../services/mockService';

interface DeveloperListProps {
  lang: Language;
}

const DeveloperList: React.FC<DeveloperListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentDev, setCurrentDev] = useState<Developer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [devToDelete, setDevToDelete] = useState<Developer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const initialFormState: Partial<Developer> = {
    name: '',
    phone: '',
    position: '',
    role: 'Developer',
    departmentId: '',
    gender: 'Male',
    avatar: '',
    birthday: '',
    email: '',
    status: 'Active',
    remarks: ''
  };
  const [formData, setFormData] = useState<Partial<Developer>>(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [devs, depts] = await Promise.all([getDevelopers(), getDepartments()]);
      setDevelopers(devs);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevs = developers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeptName = (id: string) => {
    return departments.find(d => d.id === id)?.name || id;
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      ...initialFormState,
      avatar: AVATAR_LIST.male[0] // Default avatar
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dev: Developer) => {
    setModalMode('edit');
    setCurrentDev(dev);
    setFormData({ ...dev });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (dev: Developer) => {
    setDevToDelete(dev);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) return;
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        await createDeveloper(formData);
        const newDev: Developer = {
          id: `new_${Date.now()}`,
          name: formData.name!,
          phone: formData.phone!,
          position: formData.position || '',
          role: formData.role || 'Developer',
          departmentId: formData.departmentId || '',
          gender: formData.gender as 'Male' | 'Female' || 'Male',
          avatar: formData.avatar || AVATAR_LIST.male[0],
          birthday: formData.birthday || '',
          email: formData.email || '',
          status: formData.status as 'Active' | 'Inactive' || 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          remarks: formData.remarks || ''
        };
        setDevelopers([...developers, newDev]);
      } else if (modalMode === 'edit' && currentDev) {
        await updateDeveloper(currentDev.id, formData);
        setDevelopers(prev => prev.map(d => d.id === currentDev.id ? { ...d, ...formData } as Developer : d));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!devToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDeveloper(devToDelete.id);
      setDevelopers(prev => prev.filter(d => d.id !== devToDelete.id));
      setDeleteConfirmOpen(false);
      setDevToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Combine gender-specific avatars with animal avatars
  const availableAvatars = [
    ...(formData.gender === 'Female' ? AVATAR_LIST.female : AVATAR_LIST.male),
    ...AVATAR_LIST.animals
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <Users className="text-nebula-500" />
             {t.developers}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage team members and developers.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder={t.searchDevelopers}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none w-64"
             />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon size={18} />
              </button>
           </div>
           <button 
             onClick={openCreateModal}
             className="flex items-center gap-2 bg-nebula-600 hover:bg-nebula-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-nebula-600/20"
           >
             <Plus size={18} />
             {t.createDeveloper}
           </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-nebula-500" size={32} />
        </div>
      ) : filteredDevs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <Users className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noDevelopersFound}</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                 <tr>
                    <th className="px-6 py-4">{t.devName}</th>
                    <th className="px-6 py-4">{t.devPhone}</th>
                    <th className="px-6 py-4">{t.devRole}</th>
                    <th className="px-6 py-4">{t.devDept}</th>
                    <th className="px-6 py-4">{t.devStatus}</th>
                    <th className="px-6 py-4 text-right">{t.actions}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                 {filteredDevs.map(dev => (
                    <tr key={dev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <img src={dev.avatar} alt={dev.name} className="w-8 h-8 rounded-full bg-gray-200" />
                             <div>
                                <div className="font-medium text-gray-900 dark:text-white">{dev.name}</div>
                                <div className="text-xs text-gray-500">{dev.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500 font-mono">{dev.phone}</td>
                       <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-100 dark:border-blue-800">
                             {dev.role}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500">{getDeptName(dev.departmentId)}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${
                            dev.status === 'Active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {dev.status === 'Active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                            {dev.status === 'Active' ? t.deptStatusActive : t.deptStatusInactive}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => openEditModal(dev)} className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 transition-colors">
                                <Edit size={16} />
                             </button>
                             <button onClick={() => handleDeleteClick(dev)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredDevs.map(dev => (
              <div key={dev.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group relative">
                 <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                        <button onClick={() => openEditModal(dev)} className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-50 dark:bg-gray-700 rounded shadow-sm">
                           <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(dev)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded shadow-sm">
                           <Trash2 size={14} />
                        </button>
                    </div>
                 </div>

                 <div className="flex flex-col items-center mb-4">
                    <img src={dev.avatar} alt={dev.name} className="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-gray-700 mb-3" />
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">{dev.name}</h3>
                    <p className="text-sm text-nebula-600 dark:text-nebula-400 font-medium mb-1">{dev.position}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                       <Mail size={12} /> {dev.email}
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400">{t.devRole}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{dev.role}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-400">{t.devDept}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{getDeptName(dev.departmentId)}</span>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {modalMode === 'create' ? t.createDeveloper : t.editDeveloper}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devName} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder={t.enterDevName}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devPhone} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder={t.enterDevPhone}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devEmail}</label>
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder={t.enterDevEmail}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devBirthday}</label>
                        <input 
                          type="date" 
                          value={formData.birthday} 
                          onChange={e => setFormData({...formData, birthday: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devPosition}</label>
                        <input 
                          type="text" 
                          value={formData.position} 
                          onChange={e => setFormData({...formData, position: e.target.value})}
                          placeholder={t.enterDevPosition}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devGender}</label>
                        <div className="relative">
                            <select 
                              value={formData.gender}
                              onChange={e => {
                                  const newGender = e.target.value as any;
                                  // Update gender and reset avatar to first valid choice for new gender if needed, or keep current if valid? 
                                  // Simplified: Just update gender, render will change list, current avatar might be invalid for gender visually but fine logically.
                                  // Better: Reset avatar to first of new gender list
                                  setFormData({
                                      ...formData, 
                                      gender: newGender,
                                      avatar: newGender === 'Male' ? AVATAR_LIST.male[0] : AVATAR_LIST.female[0]
                                  })
                              }}
                              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                            >
                               <option value="Male">{t.male}</option>
                               <option value="Female">{t.female}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devRole}</label>
                        <div className="relative">
                            <select 
                              value={formData.role}
                              onChange={e => setFormData({...formData, role: e.target.value})}
                              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                            >
                               <option value="Admin">Admin</option>
                               <option value="Developer">Developer</option>
                               <option value="Viewer">Viewer</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devDept}</label>
                        <div className="relative">
                            <select 
                              value={formData.departmentId}
                              onChange={e => setFormData({...formData, departmentId: e.target.value})}
                              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                            >
                               <option value="">{t.selectDevDept}</option>
                               {departments.map(d => (
                                 <option key={d.id} value={d.id}>{d.name}</option>
                               ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        </div>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devStatus}</label>
                        <div className="relative">
                            <select 
                              value={formData.status}
                              onChange={e => setFormData({...formData, status: e.target.value as any})}
                              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                            >
                               <option value="Active">{t.deptStatusActive}</option>
                               <option value="Inactive">{t.deptStatusInactive}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        </div>
                    </div>
                    
                    {/* Remarks */}
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.devRemarks}</label>
                        <textarea 
                          value={formData.remarks} 
                          onChange={e => setFormData({...formData, remarks: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none h-20 resize-none"
                        />
                    </div>

                    {/* Avatar Selection */}
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.selectAvatar}</label>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                           <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-48 overflow-y-auto pr-1">
                              {availableAvatars.map((url, index) => (
                                  <div 
                                    key={index} 
                                    onClick={() => setFormData({...formData, avatar: url})}
                                    className={`relative cursor-pointer rounded-full p-0.5 border-2 transition-all hover:scale-110 ${
                                       formData.avatar === url 
                                       ? 'border-nebula-600 bg-nebula-100 dark:bg-nebula-900' 
                                       : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                  >
                                      <img src={url} alt={`Avatar ${index}`} className="w-full h-full rounded-full" />
                                      {formData.avatar === url && (
                                         <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                            <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                                         </div>
                                      )}
                                  </div>
                              ))}
                           </div>
                        </div>
                    </div>

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
      {deleteConfirmOpen && devToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleteDeveloper}</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">{t.confirmDeleteDev}</p>
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

export default DeveloperList;