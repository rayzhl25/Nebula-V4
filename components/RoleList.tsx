import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  List as ListIcon, 
  Edit, 
  Trash2, 
  Shield, 
  Loader2,
  X,
  Save,
  CheckCircle2,
  XCircle,
  Check
} from 'lucide-react';
import { LOCALE } from '../constants';
import { Language, Role, Permission } from '../types';
import { 
  getRoles, 
  getPermissions,
  createRole, 
  updateRole, 
  deleteRole 
} from '../services/mockService';

interface RoleListProps {
  lang: Language;
}

const RoleList: React.FC<RoleListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const initialFormState: Partial<Role> = {
    name: '',
    code: '',
    description: '',
    status: 'Active',
    permissionIds: []
  };
  const [formData, setFormData] = useState<Partial<Role>>(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleData, permData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(roleData);
      setPermissions(permData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by module for UI
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(p => {
      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    });
    return groups;
  }, [permissions]);

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setModalMode('edit');
    setCurrentRole(role);
    setFormData({ ...role });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteConfirmOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const ids = prev.permissionIds || [];
      if (ids.includes(permId)) {
        return { ...prev, permissionIds: ids.filter(id => id !== permId) };
      } else {
        return { ...prev, permissionIds: [...ids, permId] };
      }
    });
  };

  const handleSelectAllPerms = () => {
    setFormData(prev => ({
        ...prev,
        permissionIds: permissions.map(p => p.id)
    }));
  };

  const handleDeselectAllPerms = () => {
    setFormData(prev => ({
        ...prev,
        permissionIds: []
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) return;
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        await createRole(formData);
        const newRole: Role = {
          id: `new_${Date.now()}`,
          name: formData.name!,
          code: formData.code!,
          description: formData.description || '',
          status: formData.status as 'Active' | 'Inactive' || 'Active',
          permissionIds: formData.permissionIds || [],
          userCount: 0
        };
        setRoles([...roles, newRole]);
      } else if (modalMode === 'edit' && currentRole) {
        await updateRole(currentRole.id, formData);
        setRoles(prev => prev.map(r => r.id === currentRole.id ? { ...r, ...formData } as Role : r));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
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
             <Shield className="text-nebula-500" />
             {t.roles}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure user access and permissions.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder={t.searchRoles}
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
             {t.createRole}
           </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-nebula-500" size={32} />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <Shield className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noRolesFound}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                 <tr>
                    <th className="px-6 py-4">{t.roleName}</th>
                    <th className="px-6 py-4">{t.roleCode}</th>
                    <th className="px-6 py-4">{t.roleUsers}</th>
                    <th className="px-6 py-4">{t.roleDesc}</th>
                    <th className="px-6 py-4">{t.roleStatus}</th>
                    <th className="px-6 py-4 text-right">{t.actions}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                 {filteredRoles.map(role => (
                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                       <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 dark:text-white">{role.name}</span>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500 font-mono bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded w-fit border border-gray-200 dark:border-gray-700">
                          {role.code}
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500">
                          <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-bold">
                             {role.userCount}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{role.description}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${
                            role.status === 'Active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {role.status === 'Active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                            {role.status === 'Active' ? t.deptStatusActive : t.deptStatusInactive}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => openEditModal(role)} className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 transition-colors">
                                <Edit size={16} />
                             </button>
                             <button onClick={() => handleDeleteClick(role)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {modalMode === 'create' ? t.createRole : t.editRole}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {/* Basic Info Section */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.roleName} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder={t.enterRoleName}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.roleCode} <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={formData.code} 
                          onChange={e => setFormData({...formData, code: e.target.value})}
                          placeholder={t.enterRoleCode}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.roleDesc}</label>
                        <input 
                          type="text" 
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.roleStatus}</label>
                        <div className="flex gap-4">
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

                 {/* Permissions Section */}
                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                       <label className="block text-lg font-bold text-gray-800 dark:text-white">{t.rolePermissions}</label>
                       <div className="space-x-3 text-sm">
                          <button onClick={handleSelectAllPerms} className="text-nebula-600 hover:text-nebula-700 dark:text-nebula-400 hover:underline">{t.selectAllPerms}</button>
                          <button onClick={handleDeselectAllPerms} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline">{t.deselectAllPerms}</button>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       {Object.entries(groupedPermissions).map(([module, perms]) => (
                          <div key={module} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                             <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                                <Shield size={16} className="text-nebula-500"/> {module}
                             </h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(perms as Permission[]).map(perm => (
                                   <label key={perm.id} className="flex items-center gap-2 cursor-pointer group select-none">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                         (formData.permissionIds || []).includes(perm.id)
                                         ? 'bg-nebula-600 border-nebula-600 text-white'
                                         : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-nebula-400'
                                      }`}>
                                         {(formData.permissionIds || []).includes(perm.id) && <Check size={14} />}
                                      </div>
                                      <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={(formData.permissionIds || []).includes(perm.id)}
                                        onChange={() => handleTogglePermission(perm.id)}
                                      />
                                      <span className="text-sm text-gray-600 dark:text-gray-300">{t[perm.labelKey as keyof typeof t] || perm.action}</span>
                                   </label>
                                ))}
                             </div>
                          </div>
                       ))}
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
      {deleteConfirmOpen && roleToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleteRole}</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">{t.confirmDeleteRole}</p>
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

export default RoleList;