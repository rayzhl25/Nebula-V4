
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  FolderOpen,
  Upload,
} from 'lucide-react';
import { MOCK_PROJECTS, LOCALE } from '../constants';
import { Language } from '../types';
import ProjectCard from './project/ProjectCard';
import ProjectRow from './project/ProjectRow';
import CreateWizard from './project/CreateWizard';
import DeleteWizard from './project/DeleteWizard';
import EditModal from './project/EditModal';
import { CopyModal, KeyModal, PublishModal } from './project/ActionModals';

interface ProjectListProps {
  lang: Language;
  onOpenProject?: (project: any) => void;
}

/**
 * 项目列表主组件 (ProjectList)
 * 负责展示项目列表（网格/列表视图）、筛选、统计以及协调各类操作弹窗。
 */
const ProjectList: React.FC<ProjectListProps> = ({ lang, onOpenProject }) => {
  const t = LOCALE[lang];
  
  // --- 视图与筛选状态 ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 视图模式切换
  const [searchTerm, setSearchTerm] = useState(''); // 搜索关键词
  const [statusFilter, setStatusFilter] = useState('All'); // 状态筛选器
  
  // --- 数据状态 ---
  const [projects, setProjects] = useState(MOCK_PROJECTS); // 项目数据源
  const fileInputRef = useRef<HTMLInputElement>(null); // 文件上传引用
  
  // --- 弹窗控制状态 ---
  const [isCreateOpen, setIsCreateOpen] = useState(false); // 创建向导
  const [editProject, setEditProject] = useState<any>(null); // 当前编辑的项目（非空即显示弹窗）
  const [deleteProject, setDeleteProject] = useState<any>(null); // 当前删除的项目
  const [copyProject, setCopyProject] = useState<any>(null); // 当前复制的项目
  const [publishProject, setPublishProject] = useState<any>(null); // 当前发布的项目
  const [keyDialog, setKeyDialog] = useState<{isOpen: boolean, project: any, key: string}>({ 
    isOpen: false, 
    project: null, 
    key: '' 
  }); // 密钥查看弹窗

  // --- 统计数据计算 (Derived State) ---
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Closed').length;

  // --- 列表筛选逻辑 ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.number && p.number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- 回调处理函数 (Actions Handlers) ---

  // 创建成功回调
  const handleCreateSuccess = (newProject: any) => {
      setProjects([newProject, ...projects]);
  };

  // 删除成功回调
  const handleDeleteSuccess = (id: number) => {
      setProjects(prev => prev.filter(p => p.id !== id));
  };

  // 更新成功回调
  const handleUpdateSuccess = (updated: any) => {
      setProjects(prev => prev.map(p => p.id === updated.id ? { ...updated, lastEdited: 'Just now' } : p));
  };

  // 复制成功回调
  const handleCopySuccess = (copied: any) => {
      setProjects([copied, ...projects]);
  };

  // 查看密钥逻辑
  const handleViewKey = (project: any) => {
      // 模拟生成密钥
      const mockKey = `nk_live_${project.id}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setKeyDialog({ isOpen: true, project, key: mockKey });
  };

  // 导出逻辑 (生成 JSON 文件)
  const handleExport = (project: any) => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    const safeName = (project.number || project.name || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `nebula-${safeName}-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导入逻辑 (解析 JSON 文件)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const itemsToImport = Array.isArray(json) ? json : [json];
        const validProjects = itemsToImport.filter(p => p.name);
        if (validProjects.length > 0) {
             const importedProjects = validProjects.map((p, index) => ({
                 ...p,
                 id: Date.now() + index + Math.floor(Math.random() * 1000), // 防止 ID 冲突
                 name: `${p.name} (Imported)`
             }));
             setProjects([...importedProjects, ...projects]);
             alert(`Successfully imported ${importedProjects.length} project(s).`);
        } else {
             alert('Invalid file format: No valid project data found.');
        }
      } catch (err) {
        console.error('Import failed', err);
        alert('Failed to parse JSON file.');
      }
      if (fileInputRef.current) fileInputRef.current.value = ''; // 重置 Input
    };
    reader.readAsText(file);
  };

  const handleOpen = (project: any) => {
    if (onOpenProject) {
        onOpenProject(project);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. 顶部 Header 与 统计卡片 */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <FolderOpen className="text-nebula-500" />
             {t.projects}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all your low-code applications in one place.</p>
        </div>
        
        <div className="flex gap-4">
           {[
               { label: t.totalProjects, val: totalProjects, color: 'text-gray-800 dark:text-white' },
               { label: t.activeProjects, val: activeProjects, color: 'text-nebula-600 dark:text-nebula-400' },
               { label: t.completedProjects, val: completedProjects, color: 'text-gray-500 dark:text-gray-400' }
           ].map((stat, i) => (
               <div key={i} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[100px]">
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.val}</span>
                  <span className="text-xs text-gray-500 uppercase">{stat.label}</span>
               </div>
           ))}
        </div>
      </div>

      {/* 2. 工具栏 (搜索、筛选、操作按钮) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 w-full gap-3">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t.searchProjects} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-nebula-500 outline-none transition-all text-gray-700 dark:text-gray-200"
              />
           </div>
           
           <div className="relative">
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
               className="appearance-none pl-4 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-nebula-500 h-full min-w-[140px]"
             >
               <option value="All">{t.filterAll}</option>
               <option value="In Progress">{t.statusInProgress}</option>
               <option value="Closed">{t.statusClosed}</option>
             </select>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* 导入按钮 */}
           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mr-2">
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 hover:bg-white dark:hover:bg-gray-600" title={t.importProject}>
                <Upload size={18} />
              </button>
           </div>

           {/* 视图切换按钮 */}
           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-400 hover:text-gray-600'}`} title={t.viewGrid}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-400 hover:text-gray-600'}`} title={t.viewList}>
                <ListIcon size={18} />
              </button>
           </div>
           
           {/* 新建项目按钮 */}
           <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-nebula-600 hover:bg-nebula-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-nebula-600/20">
             <Plus size={18} />
             <span className="hidden sm:inline">{t.createProject}</span>
           </button>
        </div>
      </div>

      {/* 3. 项目列表渲染 (网格或列表) */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <FolderOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noProjectsFound}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} onClick={() => handleOpen(project)}>
                <ProjectCard 
                    project={project} 
                    lang={lang}
                    onEdit={setEditProject}
                    onCopy={setCopyProject}
                    onViewKey={handleViewKey}
                    onPublish={setPublishProject}
                    onExport={handleExport}
                    onDelete={setDeleteProject}
                />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                 <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.projectNumber}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.projectName}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.status}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">{t.members}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t.lastEdited}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t.actions}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {filteredProjects.map(project => (
                    <ProjectRow 
                        key={project.id} 
                        project={project} 
                        lang={lang}
                        onEdit={setEditProject}
                        onCopy={setCopyProject}
                        onViewKey={handleViewKey}
                        onPublish={setPublishProject}
                        onExport={handleExport}
                        onDelete={setDeleteProject}
                    />
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* 4. 功能弹窗 (Modals) */}
      
      {/* 创建项目向导 */}
      <CreateWizard 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={handleCreateSuccess} 
        lang={lang} 
      />
      
      {/* 删除项目向导 (带组件选择和进度条) */}
      <DeleteWizard 
        isOpen={!!deleteProject} 
        onClose={() => setDeleteProject(null)} 
        onSuccess={handleDeleteSuccess} 
        project={deleteProject} 
        lang={lang} 
      />

      {/* 编辑项目弹窗 */}
      <EditModal 
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        project={editProject}
        lang={lang}
        onUpdate={handleUpdateSuccess}
      />

      {/* 复制项目确认弹窗 */}
      <CopyModal 
        isOpen={!!copyProject}
        onClose={() => setCopyProject(null)}
        project={copyProject}
        lang={lang}
        onSuccess={handleCopySuccess}
      />

      {/* 查看密钥弹窗 */}
      <KeyModal 
        isOpen={keyDialog.isOpen}
        onClose={() => setKeyDialog({ ...keyDialog, isOpen: false })}
        project={keyDialog.project}
        lang={lang}
        accessKey={keyDialog.key}
      />

      {/* 发布模板确认弹窗 */}
      <PublishModal 
        isOpen={!!publishProject}
        onClose={() => setPublishProject(null)}
        project={publishProject}
        lang={lang}
      />

    </div>
  );
};

export default ProjectList;
