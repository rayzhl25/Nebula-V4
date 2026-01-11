import React from 'react';
import { 
  Github, 
  Edit,
  Trash2, 
  Copy, 
  Key, 
  LayoutTemplate, 
  Download
} from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language } from '../../types';

interface ProjectRowProps {
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
 * 项目行组件 (ProjectRow)
 * 用于列表视图中展示单个项目的行信息。
 */
const ProjectRow: React.FC<ProjectRowProps> = ({ 
  project, lang, onEdit, onCopy, onViewKey, onPublish, onExport, onDelete 
}) => {
  const t = LOCALE[lang];

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-nebula-100 text-nebula-700 dark:bg-nebula-900/30 dark:text-nebula-400';
      case 'Closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
       {/* 编号列 */}
       <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
          {project.number || '-'}
       </td>
       
       {/* 项目名称与描述 */}
       <td className="px-6 py-4">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg ${project.color} flex items-center justify-center text-white font-bold text-xs`}>
                {project.name.charAt(0)}
             </div>
             <div>
                <p className="font-medium text-gray-800 dark:text-white group-hover:text-nebula-600 transition-colors">{project.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">{project.desc}</p>
             </div>
          </div>
       </td>
       
       {/* 状态列 */}
       <td className="px-6 py-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
             {project.status === 'In Progress' ? t.statusInProgress : t.statusClosed}
          </span>
       </td>
       
       {/* 成员列 (仅桌面端显示) */}
       <td className="px-6 py-4 hidden md:table-cell">
          <div className="flex -space-x-2">
             {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
             ))}
          </div>
       </td>
       
       {/* 最后编辑时间 */}
       <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
          {project.lastEdited}
       </td>
       
       {/* 操作按钮组 (Hover 显示) */}
       <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             {project.status !== 'Closed' && (
                <button 
                  onClick={() => onEdit(project)}
                  className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                  title={t.edit}
                >
                    <Edit size={14} />
                </button>
             )}
             <button className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" title={t.pushToGithub}>
                <Github size={14} />
             </button>
             <button 
               onClick={(e) => onCopy(project, e)}
               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
               title={t.copy}
             >
                <Copy size={14} />
             </button>
             <button 
               onClick={() => onViewKey(project)}
               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
               title={t.viewKey}
             >
                <Key size={14} />
             </button>
             <button 
               onClick={() => onPublish(project)}
               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
               title={t.publishTemplate}
             >
                <LayoutTemplate size={14} />
             </button>
             <button 
               onClick={() => onExport(project)}
               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
               title={t.exportProject}
             >
                <Download size={14} />
             </button>
             <button 
               onClick={() => onDelete(project)}
               className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
               title={t.delete}
             >
                <Trash2 size={14} />
             </button>
          </div>
       </td>
    </tr>
  );
};

export default ProjectRow;