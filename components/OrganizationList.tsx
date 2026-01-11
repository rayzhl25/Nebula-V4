import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Building, 
  Edit, 
  Trash2, 
  Loader2,
  X,
  Save,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { LOCALE } from '../constants';
import { Language } from '../types';
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '../services/mockService';

interface OrganizationListProps {
  lang: Language;
}

const OrganizationList: React.FC<OrganizationListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    code: '',
    owner: '',
    status: 'Active',
    logo: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ ...initialFormState, logo: 'NC' }); // Default logo placeholder
    setIsModalOpen(true);
  };

  const openEditModal = (org: any) => {
    setModalMode('edit');
    setCurrentOrg(org);
    setFormData({
        name: org.name,
        code: org.code,
        owner: org.owner,
        status: org.status,
        logo: org.logo
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (org: any) => {
    setOrgToDelete(org);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) return;
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        await createOrganization(formData);
        const newOrg = {
          id: `org_${Date.now()}`,
          ...formData,
          created: new Date().toISOString().split('T')[0]
        };
        setOrganizations([...organizations, newOrg]);
      } else if (modalMode === 'edit' && currentOrg) {
        await updateOrganization(currentOrg.id, formData);
        setOrganizations(prev => prev.map(o => o.id === currentOrg.id ? { ...o, ...formData } : o));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!orgToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrganization(orgToDelete.id);
      setOrganizations(prev => prev.filter(o => o.id !== orgToDelete.id));
      setDeleteConfirmOpen(false);
      setOrgToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <Building className="text-nebula-500" />
             {t.organizations}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage tenants and top-level organizations.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder={t.searchOrgs}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none w-64"
             />
          </div>
          <button 
             onClick={openCreateModal}
             className="flex items-center gap-2 bg-nebula-600 hover:bg-nebula-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-nebula-600/20"
           >
             <Plus size={18} />
             {t.createOrg}
           </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-nebula-500" size={32} />
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <Building className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noOrgsFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredOrgs.map(org => (
              <div key={org.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group relative">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-nebula-100 dark:bg-nebula-900/30 text-nebula-600 dark:text-nebula-400 flex items-center justify-center font-bold text-lg">
                       {org.logo || org.name.charAt(0)}
                    </div>
                    <div className="relative group/menu">
                       <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreVertical size={18} />
                       </button>
                       {/* Safe hover bridge */}
                       <div className="absolute right-0 top-full pt-2 w-32 hidden group-hover/menu:block z-20">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1">
                              <button onClick={() => openEditModal(org)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                 <Edit size={14} /> {t.edit}
                              </button>
                              <button onClick={() => handleDeleteClick(org)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                 <Trash2 size={14} /> {t.delete}
                              </button>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">{org.name}</h3>
                 <p className="text-xs text-gray-500 font-mono mb-4 bg-gray-100 dark:bg-gray-700 w-fit px-2 py-0.5 rounded">{org.code}</p>
                 
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                       <span className="text-gray-400">{t.orgOwner}:</span>
                       <span>{org.owner}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                       <span className="text-gray-400">{t.orgCreated}:</span>
                       <span className="flex items-center gap-1"><Calendar size={12}/> {org.created}</span>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-3 flex justify-between items-center text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                       org.status === 'Active' 
                       ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                       : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                       {org.status === 'Active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                       {org.status === 'Active' ? t.deptStatusActive : t.deptStatusInactive}
                    </span>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {modalMode === 'create' ? t.createOrg : t.editOrg}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.orgName} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder={t.enterOrgName}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.orgCode} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      placeholder={t.enterOrgCode}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.orgOwner}</label>
                    <input 
                      type="text" 
                      value={formData.owner} 
                      onChange={e => setFormData({...formData, owner: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.orgStatus}</label>
                    <div className="flex gap-4 mt-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="status" 
                            checked={formData.status === 'Active'} 
                            onChange={() => setFormData({...formData, status: 'Active'})}
                            className="text-nebula-600 focus:ring-nebula-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t.deptStatusActive}</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="status" 
                            checked={formData.status === 'Inactive'} 
                            onChange={() => setFormData({...formData, status: 'Inactive'})}
                            className="text-gray-500 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t.deptStatusInactive}</span>
                       </label>
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
      {deleteConfirmOpen && orgToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleteOrg}</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">{t.confirmDeleteOrg}</p>
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

export default OrganizationList;