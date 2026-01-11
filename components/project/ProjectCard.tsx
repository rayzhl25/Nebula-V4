
import React from 'react';
import { 
  MoreVertical, 
  Github, 
  Clock, 
  Edit,
  Trash2, 
  Copy, 
  Key, 
  LayoutTemplate, 
  Download,
  ArrowRight
} from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language } from '../../types';

interface ProjectCardProps {
  project: any;
  lang: Language;
  onEdit: (project: any) => void;
  onCopy: (project: any, e: React.MouseEvent) => void;
  onViewKey: (project: any) => void;
  onPublish: (project: any) => void;
  onExport: (project: any) => void;
  onDelete: (project: any) => void;
}

/**
 * 项目卡片组件 (ProjectCard)
 * 用于网格视图中展示单个项目的信息。
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, lang, onEdit, onCopy, onViewKey, onPublish, onExport, onDelete 
}) => {
  const t = LOCALE[lang];

  // 根据状态获取颜色样式
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-nebula-100 text-nebula-700 dark:bg-nebula-900/30 dark:text-nebula-400';
      case 'Closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAction = (e: React.MouseEvent, action: (p: any) => void) => {
      e.stopPropagation();
      action(project);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-nebula-500 dark:hover:border-nebula-500 transition-all hover:shadow-lg flex flex-col h-full relative overflow-hidden cursor-pointer">
       {/* 顶部颜色条 */}
       <div className={`h-2 w-full ${project.color}`}></div>
       
       <div className="p-5 flex-1 flex flex-col">
          {/* 头部：图标与状态 */}
          <div className="flex justify-between items-start mb-3">
             <div className={`w-10 h-10 rounded-lg ${project.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-gray-800 dark:text-white font-bold`}>
                {project.name.charAt(0)}
             </div>
             <div className="flex gap-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                   {project.status === 'In Progress' ? t.statusInProgress : t.statusClosed}
                </span>
                
                {/* 更多操作下拉菜单 */}
                <div className="dropdown relative group/menu" onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                     <MoreVertical size={16} />
                  </button>
                  
                  <div className="hidden group-hover/menu:block absolute right-0 top-full pt-1 w-32 z-20">
                     <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1">
                       <button onClick={(e) => handleAction(e, onEdit)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                         <Edit size={14} /> {t.edit}
                       </button>
                       <button onClick={(e) => onCopy(project, e)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                         <Copy size={14} /> {t.copy}
                       </button>
                       <button onClick={(e) => handleAction(e, onViewKey)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                         <Key size={14} /> {t.viewKey}
                       </button>
                       <button onClick={(e) => handleAction(e, onPublish)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                         <LayoutTemplate size={14} /> {t.publishTemplate}
                       </button>
                       <button onClick={(e) => handleAction(e, onExport)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                         <Download size={14} /> {t.exportProject}
                       </button>
                       <button onClick={(e) => handleAction(e, onDelete)} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                         <Trash2 size={14} /> {t.delete}
                       </button>
                     </div>
                  </div>
                </div>
             </div>
          </div>
          
          <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 group-hover:text-nebula-600 dark:group-hover:text-nebula-400 transition-colors">{project.name}</h3>
          {project.number && <p className="text-xs text-gray-400 mb-2 font-mono">{project.number}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{project.desc}</p>
          
          {/* 成员头像与时间 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-gray-500">U{i}</div>
                ))}
             </div>
             <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {project.lastEdited}
             </div>
          </div>
       </div>
       
       {/* 底部快捷操作条 */}
       <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-nebula-50 dark:group-hover:bg-nebula-900/10 transition-colors h-[45px]">
          <button className="text-xs font-medium text-gray-500 hover:text-nebula-600 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
             <Github size={14} /> GitHub
          </button>
          {project.status !== 'Closed' && (
            <button className="text-xs font-medium text-nebula-600 hover:text-nebula-700 flex items-center gap-1">
               Open App <ArrowRight size={12} />
            </button>
          )}
       </div>
    </div>
  );
};

export default ProjectCard;
