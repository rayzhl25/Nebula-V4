import React, { useState, useEffect, useMemo } from 'react';
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
  Building2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  CornerDownRight
} from 'lucide-react';
import { LOCALE } from '../constants';
import { Language, Department } from '../types';
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '../services/mockService';

interface DepartmentListProps {
  lang: Language;
}

interface DepartmentWithDepth extends Department {
  depth: number;
}

const DepartmentList: React.FC<DepartmentListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Tree View State
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    code: '',
    manager: '',
    status: 'Active',
    description: '',
    parentId: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
      // Auto expand all by default for better visibility
      setExpandedIds(new Set(data.map(d => d.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build tree from flat list
  const buildTree = (items: Department[]) => {
    const data = JSON.parse(JSON.stringify(items)) as Department[];
    const map: Record<string, Department> = {};
    const roots: Department[] = [];

    data.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    data.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children!.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    return roots;
  };

  // Flatten tree for list view rendering with indentation
  const flattenTree = (
    nodes: Department[], 
    depth = 0, 
    search = ''
  ): DepartmentWithDepth[] => {
    let result: DepartmentWithDepth[] = [];
    
    nodes.forEach(node => {
      // If searching, only include matches or their parents (simple filter here just matches)
      // For hierarchical filter, ideally we show path to matched node. 
      // Simple implementation: If search exists, just flat filter. If no search, show tree.
      if (search) {
        if (node.name.toLowerCase().includes(search.toLowerCase()) || node.code.toLowerCase().includes(search.toLowerCase())) {
          result.push({ ...node, depth: 0 });
        }
        if (node.children) {
           result = result.concat(flattenTree(node.children, 0, search));
        }
      } else {
        result.push({ ...node, depth });
        if (expandedIds.has(node.id) && node.children && node.children.length > 0) {
          result = result.concat(flattenTree(node.children, depth + 1, search));
        }
      }
    });
    return result;
  };

  const treeData = useMemo(() => buildTree(departments), [departments]);
  const visibleDepartments = useMemo(() => flattenTree(treeData, 0, searchTerm), [treeData, expandedIds, searchTerm]);

  // Toggle Row Expansion
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      code: '',
      manager: '',
      status: 'Active',
      description: '',
      parentId: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setModalMode('edit');
    setCurrentDept(dept);
    setFormData({ ...dept, parentId: dept.parentId || '' });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (dept: Department) => {
    setDeptToDelete(dept);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) return;
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        await createDepartment(formData);
        // Optimistic update
        const newDept: Department = {
            id: `new_${Date.now()}`,
            name: formData.name!,
            code: formData.code!,
            manager: formData.manager || 'Unassigned',
            memberCount: 0,
            status: formData.status as 'Active' | 'Inactive' || 'Active',
            description: formData.description || '',
            parentId: formData.parentId || null
        };
        setDepartments([...departments, newDept]);
      } else if (modalMode === 'edit' && currentDept) {
        await updateDepartment(currentDept.id, formData);
        setDepartments(prev => prev.map(d => d.id === currentDept.id ? { ...d, ...formData, parentId: formData.parentId || null } as Department : d));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deptToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDepartment(deptToDelete.id);
      setDepartments(prev => prev.filter(d => d.id !== deptToDelete.id));
      setDeleteConfirmOpen(false);
      setDeptToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter possible parents (prevent self-selection and cyclic selection if strictly hierarchical logic added later)
  const availableParents = departments.filter(d => 
    modalMode === 'create' || (currentDept && d.id !== currentDept.id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <Users className="text-nebula-500" />
             {t.departments}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage organization structure and teams.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder={t.searchDepartments}
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
             {t.createDepartment}
           </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-nebula-500" size={32} />
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <Building2 className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noDepartmentsFound}</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                 <tr>
                    <th className="px-6 py-4 w-[30%]">{t.deptName}</th>
                    <th className="px-6 py-4">{t.deptCode}</th>
                    <th className="px-6 py-4">{t.deptManager}</th>
                    <th className="px-6 py-4">{t.deptMembers}</th>
                    <th className="px-6 py-4">{t.deptStatus}</th>
                    <th className="px-6 py-4 text-right">{t.actions}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                 {visibleDepartments.map(dept => {
                   // Check if original node has children for toggle button (not based on flatten result but original mapping)
                   // We can efficiently check if any other node lists this as parent in the flat list, or check treeData children count.
                   // The flattenTree output doesn't carry 'children' array of the original node.
                   // Let's use `departments` list to check if any child exists.
                   const hasChildren = departments.some(d => d.parentId === dept.id);

                   return (
                    <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center" style={{ paddingLeft: `${dept.depth * 24}px` }}>
                             {/* Indentation Visuals */}
                             {dept.depth > 0 && <CornerDownRight size={14} className="text-gray-300 mr-2 -ml-2" />}
                             
                             {/* Toggle Button or Spacer */}
                             {!searchTerm && hasChildren ? (
                               <button 
                                 onClick={() => toggleExpand(dept.id)}
                                 className="mr-2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                               >
                                 {expandedIds.has(dept.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                               </button>
                             ) : (
                               <div className="w-6 mr-2"></div>
                             )}

                             <span className={`font-medium text-gray-900 dark:text-white ${dept.depth === 0 ? 'text-base' : 'text-sm'}`}>
                                {dept.name}
                             </span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500 font-mono">{dept.code}</td>
                       <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-nebula-100 dark:bg-nebula-900/30 flex items-center justify-center text-xs text-nebula-700 dark:text-nebula-400 font-bold">
                             {dept.manager.charAt(0)}
                          </div>
                          {dept.manager}
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500">{dept.memberCount}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${
                            dept.status === 'Active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {dept.status === 'Active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                            {dept.status === 'Active' ? t.deptStatusActive : t.deptStatusInactive}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => openEditModal(dept)} className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 transition-colors">
                                <Edit size={16} />
                             </button>
                             <button onClick={() => handleDeleteClick(dept)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                   );
                 })}
              </tbody>
           </table>
        </div>
      ) : (
        // Simple Grid View (Flattened)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {visibleDepartments.map(dept => (
              <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group relative">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                       <Building2 size={20} />
                    </div>
                    <div className="relative group/menu">
                       <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreVertical size={18} />
                       </button>
                       {/* Safe hover bridge */}
                       <div className="absolute right-0 top-full pt-2 w-32 hidden group-hover/menu:block z-20">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1">
                              <button onClick={() => openEditModal(dept)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                 <Edit size={14} /> {t.edit}
                              </button>
                              <button onClick={() => handleDeleteClick(dept)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                 <Trash2 size={14} /> {t.delete}
                              </button>
                          </div>
                       </div>
                    </div>
                 </div>
                 <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1 flex items-center gap-2">
                    {dept.name}
                 </h3>
                 <p className="text-xs text-gray-500 font-mono mb-3">{dept.code}</p>
                 {dept.parentId && (
                     <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <CornerDownRight size={12} />
                        Parent: {departments.find(d => d.id === dept.parentId)?.name || dept.parentId}
                     </p>
                 )}
                 <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-4">{dept.description}</p>
                 
                 <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                       <Users size={14} /> {dept.memberCount}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                       dept.status === 'Active' 
                       ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                       : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                       {dept.status === 'Active' ? t.deptStatusActive : t.deptStatusInactive}
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
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {modalMode === 'create' ? t.createDepartment : t.editDepartment}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.parentDepartment}</label>
                    <div className="relative">
                        <select
                          value={formData.parentId || ''}
                          onChange={e => setFormData({...formData, parentId: e.target.value})}
                          className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                        >
                            <option value="">{t.rootDepartment}</option>
                            {availableParents.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.deptName} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder={t.enterDeptName}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.deptCode} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      placeholder={t.enterDeptCode}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.deptManager}</label>
                    <div className="relative">
                        <select 
                          value={formData.manager}
                          onChange={e => setFormData({...formData, manager: e.target.value})}
                          className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none appearance-none"
                        >
                           <option value="">{t.managerPlaceholder}</option>
                           <option value="Alice Smith">Alice Smith</option>
                           <option value="Bob Johnson">Bob Johnson</option>
                           <option value="Carol Williams">Carol Williams</option>
                           <option value="David Brown">David Brown</option>
                           <option value="Eva Davis">Eva Davis</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.deptStatus}</label>
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
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.deptDesc}</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none h-24 resize-none"
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
      {deleteConfirmOpen && deptToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleteDepartment}</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">{t.confirmDeleteDept}</p>
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

export default DepartmentList;