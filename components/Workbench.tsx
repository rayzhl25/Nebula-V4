
import React, { useState } from 'react';
import { 
  PlayCircle, 
  FolderKanban, 
  Rocket, 
  PlusCircle, 
  Download, 
  BookOpen, 
  FileText, 
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Search,
  Github,
  Check,
  X,
  Database,
  Layout,
  ArrowLeft,
  Server,
  HardDrive,
  Leaf,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { LOCALE, MOCK_PROJECTS, TRAINING_VIDEOS, HELP_LINKS, MOCK_TEMPLATES } from '../constants';
import { Language, User } from '../types';
import { createProject } from '../services/mockService';

interface WorkbenchProps {
  lang: Language;
  user: User;
  onOpenProject?: (project: any) => void;
}

const Workbench: React.FC<WorkbenchProps> = ({ lang, user, onOpenProject }) => {
  const t = LOCALE[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingIds, setSyncingIds] = useState<number[]>([]);
  const [syncedIds, setSyncedIds] = useState<number[]>([]);
  
  // Projects State (Local copy to simulate addition)
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: '',
    projectNumber: '',
    desc: '',
    templateId: 'blank',
    dbType: 'mysql',
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: '',
    dbUser: '',
    dbPassword: '',
    dbTestConnection: false
  });

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePushToGithub = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (syncingIds.includes(id) || syncedIds.includes(id)) return;

    setSyncingIds(prev => [...prev, id]);
    
    // Simulate API call delay
    setTimeout(() => {
      setSyncingIds(prev => prev.filter(pid => pid !== id));
      setSyncedIds(prev => [...prev, id]);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSyncedIds(prev => prev.filter(pid => pid !== id));
      }, 2000);
    }, 1500);
  };

  const handleOpenProject = (project: any) => {
    if (onOpenProject) {
      onOpenProject(project);
    }
  };

  const openWizard = () => {
    setWizardStep(1);
    setWizardData({
      name: '',
      projectNumber: '',
      desc: '',
      templateId: 'blank',
      dbType: 'mysql',
      dbHost: 'localhost',
      dbPort: '3306',
      dbName: '',
      dbUser: '',
      dbPassword: '',
      dbTestConnection: false
    });
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    if (isCreating) return;
    setIsWizardOpen(false);
  };

  const handleCreateProject = async () => {
    // 1. Validation
    if (!wizardData.name.trim()) {
      alert(t.namePlaceholder); // In a real app, use a toast or UI error state
      setWizardStep(1); // Jump back to step 1 to show error
      return;
    }
    if (!wizardData.projectNumber.trim()) {
        alert(t.projectNumberPlaceholder);
        setWizardStep(1);
        return;
    }

    setIsCreating(true);

    try {
      // 2. Call Backend API
      await createProject(wizardData);

      // 3. Update Local State (On Success)
      const newProject = {
        id: projects.length + 100 + Date.now(),
        name: wizardData.name,
        number: wizardData.projectNumber,
        desc: wizardData.desc || 'No description',
        status: 'Draft',
        lastEdited: 'Just now',
        color: 'bg-nebula-500', // Default color for new projects
        size: '0 MB',
        created: new Date().toISOString().split('T')[0]
      };
      
      setProjects([newProject, ...projects]);
      setIsWizardOpen(false);
      
      // Optional: Show success message
      // alert(t.successCreated); 

    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const dbTypes = [
    { id: 'mysql', label: 'MySQL', icon: Database, defaultPort: '3306' },
    { id: 'postgresql', label: 'PostgreSQL', icon: Server, defaultPort: '5432' },
    { id: 'oracle', label: 'Oracle', icon: PlayCircle, defaultPort: '1521' }, // Using PlayCircle as Disc icon alternative or placeholder if Disc not available in current imports
    { id: 'dameng', label: 'Dameng', icon: HardDrive, defaultPort: '5236' },
    { id: 'kingbase', label: 'Kingbase', icon: Check, defaultPort: '54321' }, // Using Check as Crown placeholder
  ];

  const handleDbTypeSelect = (typeId: string, defaultPort: string) => {
    setWizardData(prev => ({
      ...prev,
      dbType: typeId,
      dbPort: defaultPort
    }));
  };

  // Render Wizard Step Content
  const renderWizardContent = () => {
    switch(wizardStep) {
      case 1: // Basic Info
        return (
          <div className="space-y-6 animate-fade-in px-2">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.step1}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">请输入项目的基本信息，这些信息将用于识别和管理您的项目。</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.projectName} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.name}
                    onChange={(e) => setWizardData({...wizardData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.namePlaceholder}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.projectNumber} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.projectNumber}
                    onChange={(e) => setWizardData({...wizardData, projectNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.projectNumberPlaceholder}
                  />
                </div>
             </div>

             <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectDesc}</label>
               <textarea 
                 value={wizardData.desc}
                 onChange={(e) => setWizardData({...wizardData, desc: e.target.value})}
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white h-32 resize-none"
                 placeholder={t.descPlaceholder}
               />
             </div>
          </div>
        );
      case 2: // Template Selection
        return (
          <div className="space-y-8 animate-fade-in px-2 py-4">
             {/* Header Section */}
             <div className="text-left md:text-left mb-6">
               <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t.selectTemplateTitle}</h3>
               <p className="text-gray-500 dark:text-gray-400">{t.selectTemplateDesc}</p>
             </div>
             
             {/* Templates Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_TEMPLATES.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={() => setWizardData({...wizardData, templateId: tpl.id})}
                    className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center group h-full ${
                      wizardData.templateId === tpl.id 
                        ? 'border-nebula-500 bg-nebula-50/50 dark:bg-nebula-900/20 shadow-md ring-1 ring-nebula-500' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-nebula-400 dark:hover:border-nebula-500 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {/* Icon Container */}
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-colors ${
                       wizardData.templateId === tpl.id 
                       ? 'bg-nebula-600 text-white' 
                       : 'bg-blue-50 dark:bg-gray-700 text-nebula-600 dark:text-nebula-400 group-hover:bg-nebula-600 group-hover:text-white'
                    }`}>
                      <tpl.icon size={32} />
                    </div>
                    
                    {/* Title */}
                    <h4 className={`font-bold text-lg mb-3 ${
                        wizardData.templateId === tpl.id ? 'text-nebula-700 dark:text-nebula-300' : 'text-gray-800 dark:text-white'
                    }`}>
                      {t[tpl.nameKey as keyof typeof t]}
                    </h4>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                      {t[tpl.descKey as keyof typeof t]}
                    </p>
                    
                    {/* Selection Indicator (Optional visual cue) */}
                    {wizardData.templateId === tpl.id && (
                        <div className="absolute top-4 right-4 text-nebula-600 dark:text-nebula-400">
                            <Check size={20} className="bg-white dark:bg-gray-800 rounded-full p-0.5" />
                        </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        );
      case 3: // Database Config
        return (
          <div className="space-y-8 animate-fade-in px-2 py-4">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.dbConfigTitle}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">{t.dbConfigDesc}</p>
             </div>
             
             {/* DB Type Selection Cards */}
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {dbTypes.map((type) => (
                 <div 
                   key={type.id}
                   onClick={() => handleDbTypeSelect(type.id, type.defaultPort)}
                   className={`
                     cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-2 transition-all h-24
                     ${wizardData.dbType === type.id 
                       ? 'border-nebula-500 bg-nebula-50 dark:bg-nebula-900/20 text-nebula-700 dark:text-nebula-300' 
                       : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-nebula-300'}
                   `}
                 >
                   <type.icon size={24} className={wizardData.dbType === type.id ? 'text-nebula-600' : 'text-gray-400'} />
                   <span className="font-bold text-xs">{type.label}</span>
                 </div>
               ))}
             </div>

             {/* Connection Form */}
             <div className="space-y-4">
               {/* Host */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.dbHost} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.dbHost}
                    onChange={(e) => setWizardData({...wizardData, dbHost: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                  />
               </div>

               {/* Port */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.dbPort} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.dbPort}
                    onChange={(e) => setWizardData({...wizardData, dbPort: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                  />
               </div>

               {/* DB Name */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.dbName} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.dbName}
                    onChange={(e) => setWizardData({...wizardData, dbName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.dbNamePlaceholder}
                  />
               </div>

               {/* User */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.dbUser} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.dbUser}
                    onChange={(e) => setWizardData({...wizardData, dbUser: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.dbUserPlaceholder}
                  />
               </div>

               {/* Password */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.dbPassword} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    value={wizardData.dbPassword}
                    onChange={(e) => setWizardData({...wizardData, dbPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.dbPasswordPlaceholder}
                  />
               </div>

               {/* Test Connection Checkbox */}
               <div className="pt-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={wizardData.dbTestConnection}
                     onChange={(e) => setWizardData({...wizardData, dbTestConnection: e.target.checked})}
                     className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                   />
                   <span className="text-sm text-gray-700 dark:text-gray-300">{t.dbTestConnection}</span>
                 </label>
               </div>
             </div>
          </div>
        );
      case 4: // Confirmation
        const selectedTpl = MOCK_TEMPLATES.find(t => t.id === wizardData.templateId);
        return (
          <div className="space-y-6 animate-fade-in px-2">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.step4}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">请核对以下信息，确认无误后点击创建。</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                   <span className="text-gray-500 dark:text-gray-400">{t.projectName}</span>
                   <span className="font-medium text-gray-800 dark:text-white">{wizardData.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                   <span className="text-gray-500 dark:text-gray-400">{t.projectNumber}</span>
                   <span className="font-medium text-gray-800 dark:text-white">{wizardData.projectNumber}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                   <span className="text-gray-500 dark:text-gray-400">{t.selectTemplate}</span>
                   <span className="font-medium text-gray-800 dark:text-white flex items-center gap-1">
                      {selectedTpl && <selectedTpl.icon size={14} />}
                      {selectedTpl ? t[selectedTpl.nameKey as keyof typeof t] : '-'}
                   </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                   <span className="text-gray-500 dark:text-gray-400">{t.dbType}</span>
                   <span className="font-medium text-gray-800 dark:text-white uppercase">{wizardData.dbType}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                   <span className="text-gray-500 dark:text-gray-400">{t.dbHost}</span>
                   <span className="font-medium text-gray-800 dark:text-white">{wizardData.dbHost}:{wizardData.dbPort}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                   <span className="text-gray-500 dark:text-gray-400">{t.dbName}</span>
                   <span className="font-medium text-gray-800 dark:text-white">{wizardData.dbName || '-'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500 dark:text-gray-400">{t.dbUser}</span>
                   <span className="font-medium text-gray-800 dark:text-white">{wizardData.dbUser || '-'}</span>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner - Nebula Blue with Purple Accent */}
      <div className="bg-gradient-to-r from-nebula-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{t.welcome}, {user.name}!</h1>
        <p className="opacity-90 max-w-2xl text-lg">{t.loginDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN - Main Content (Recent Projects) - Now takes 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FolderKanban className="text-nebula-500" size={20}/>
                {t.recentProjects}
              </h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input
                      type="text"
                      placeholder={t.searchProjects}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-nebula-500 outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                   />
                </div>
                <button className="text-sm text-nebula-600 dark:text-nebula-400 hover:underline whitespace-nowrap hidden sm:block">{t.viewAll}</button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               
               {/* Add New Placeholder - Always First */}
               <div 
                  onClick={openWizard}
                  className="group p-5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-nebula-400 dark:hover:border-nebula-500/50 hover:bg-nebula-50 dark:hover:bg-nebula-900/10 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-nebula-500 min-h-[180px]"
               >
                  <PlusCircle size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">{t.createProject}</span>
               </div>

               {/* Filtered Projects */}
               {filteredProjects.map(project => (
                 <div onClick={() => handleOpenProject(project)} key={project.id} className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-nebula-500 dark:hover:border-nebula-500 hover:shadow-md transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/50 relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                        {project.name.substring(0,1)}
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium">
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 group-hover:text-nebula-600 dark:group-hover:text-nebula-400 transition-colors">{project.name}</h3>
                    {project.number && <p className="text-xs text-gray-400 mb-2 font-mono">{project.number}</p>}
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">{project.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700/50">
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                          <Clock size={12} /> {t.lastEdited}: {project.lastEdited}
                        </div>
                        
                        {/* GitHub Push Button */}
                        <button 
                          onClick={(e) => handlePushToGithub(project.id, e)}
                          className={`p-1.5 rounded-md transition-all duration-300 flex items-center gap-1 ${
                            syncedIds.includes(project.id) 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-800 dark:hover:text-white'
                          }`}
                          title={t.pushToGithub}
                        >
                          {syncingIds.includes(project.id) ? (
                             <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full opacity-70"/>
                          ) : syncedIds.includes(project.id) ? (
                             <>
                               <Check size={14} />
                               <span className="text-xs font-medium hidden sm:inline">{t.synced}</span>
                             </>
                          ) : (
                             <Github size={16} />
                          )}
                        </button>
                    </div>
                 </div>
               ))}

               {/* No Results State */}
               {filteredProjects.length === 0 && searchTerm && (
                 <div className="col-span-full md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center py-10 text-gray-400">
                    <Search size={32} className="mb-2 opacity-50" />
                    <p>{t.noProjectsFound}</p>
                 </div>
               )}
               
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar (Quick Start & Help) - Now takes 1/4 width (implicit) */}
        <div className="space-y-6">
          
          {/* Newcomer Guide Link - Gradient Nebula Blue to Purple */}
          <a 
            href="https://guide.xingyunzuo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-nebula-500 to-purple-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 group relative overflow-hidden"
          >
             {/* Decorative background element */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
             
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                   <Compass size={20} className="text-purple-100" />
                   {t.newcomerGuide}
                 </h3>
                 <p className="text-purple-100 text-xs opacity-90">{t.newcomerGuideDesc}</p>
               </div>
               <ExternalLink size={18} className="text-purple-200 group-hover:text-white transition-colors" />
             </div>
          </a>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
               <Rocket size={18} className="text-amber-500"/> {t.quickActions}
             </h3>
             <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={openWizard}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-nebula-50 dark:bg-nebula-900/20 text-nebula-600 dark:text-nebula-300 hover:bg-nebula-100 dark:hover:bg-nebula-900/40 transition-colors border border-nebula-100 dark:border-nebula-800/50"
               >
                 <PlusCircle size={24} className="mb-2"/>
                 <span className="text-xs font-medium">{t.createProject}</span>
               </button>
               <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800/50">
                 <Download size={24} className="mb-2"/>
                 <span className="text-xs font-medium">{t.importProject}</span>
               </button>
             </div>
          </div>

          {/* Training Videos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
               <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <PlayCircle size={18} className="text-red-500"/> {t.trainingVideos}
               </h3>
             </div>
             <div className="divide-y divide-gray-100 dark:divide-gray-700">
               {TRAINING_VIDEOS.map(video => (
                 <a 
                    key={video.id} 
                    href={(video as any).url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors block"
                 >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors relative">
                      <PlayCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-nebula-600 dark:group-hover:text-nebula-400 transition-colors">{video.title}</p>
                      <p className="text-xs text-gray-500">{t.videoDuration}: {video.duration}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                 </a>
               ))}
             </div>
          </div>

          {/* User Manual / Help */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
               <BookOpen size={18} className="text-emerald-500"/> {t.userManual}
             </h3>
             <ul className="space-y-3">
               {HELP_LINKS.map(link => (
                 <li key={link.id}>
                   <a 
                     href={link.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-nebula-600 dark:hover:text-nebula-400 transition-colors"
                   >
                     <FileText size={16} className="opacity-70" />
                     {t[link.titleKey as keyof typeof t]}
                   </a>
                 </li>
               ))}
             </ul>
             <button className="w-full mt-4 py-2 text-xs font-medium text-center text-gray-500 dark:text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-nebula-300 transition-colors">
                {t.helpCenter}
             </button>
          </div>

        </div>
      </div>

      {/* Project Creation Wizard Modal */}
      {isWizardOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
             
             {/* Header - Purple to Blue Gradient */}
             <div className="bg-gradient-to-r from-purple-600 to-nebula-600 p-8 text-white relative flex-shrink-0">
                <h2 className="text-2xl font-bold mb-2">{t.createProjectTitle}</h2>
                <p className="opacity-80 text-sm">{t.createProjectSubtitle}</p>
             </div>

             {/* Stepper Container */}
             <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
               <div className="max-w-4xl mx-auto px-6 py-6">
                 <div className="flex items-center justify-between relative">
                   {/* Background Connection Line */}
                   <div className="absolute left-0 top-4 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                   
                   {/* Dynamic Progress Line (Connects completed circles) */}
                   <div 
                     className="absolute left-0 top-4 h-0.5 bg-nebula-600 dark:bg-nebula-400 transition-all duration-300 -z-0"
                     style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
                   ></div>
                   
                   {[1, 2, 3, 4].map(step => {
                     const isCompleted = step < wizardStep;
                     const isCurrent = step === wizardStep;
                     
                     return (
                        <div 
                           key={step} 
                           onClick={() => !isCreating && step < wizardStep && setWizardStep(step)}
                           className={`relative z-10 flex flex-col items-center gap-2 group ${step < wizardStep && !isCreating ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 
                             ${isCompleted 
                                ? 'bg-nebula-600 border-nebula-600 text-white' 
                                : isCurrent 
                                  ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110' 
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                             }
                             ${isCompleted && !isCreating ? 'group-hover:bg-nebula-700' : ''}
                           `}>
                             {isCompleted ? <Check size={16} /> : step}
                           </div>
                           <span className={`text-xs font-medium transition-colors 
                             ${isCompleted 
                               ? 'text-nebula-600 dark:text-nebula-400' 
                               : isCurrent 
                                 ? 'text-purple-600 dark:text-purple-400 font-bold' 
                                 : 'text-gray-400'
                             }
                           `}>
                             {t[`step${step}` as keyof typeof t]}
                           </span>
                        </div>
                     );
                   })}
                 </div>
               </div>
               
               {/* Bottom Progress Bar */}
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-full bg-gradient-to-r from-nebula-500 to-purple-600 transition-all duration-500 ease-out"
                    style={{ width: `${(wizardStep / 4) * 100}%` }}
                  ></div>
               </div>
             </div>

             {/* Content Body */}
             <div 
               className="p-8 overflow-y-auto bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:hidden"
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             >
                <div className="max-w-4xl mx-auto">
                   {renderWizardContent()}
                </div>
             </div>

             {/* Footer Buttons */}
             <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
                {/* Left Side: Previous */}
                <div>
                  {wizardStep > 1 && (
                    <button 
                      onClick={() => setWizardStep(prev => prev - 1)}
                      disabled={isCreating}
                      className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft size={16} />
                      {t.prev}
                    </button>
                  )}
                </div>

                {/* Right Side: Cancel & Next */}
                <div className="flex gap-4">
                  <button 
                    onClick={closeWizard}
                    disabled={isCreating}
                    className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.cancel}
                  </button>

                  {wizardStep < 4 ? (
                    <button 
                      onClick={() => setWizardStep(prev => prev + 1)}
                      className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        (wizardStep === 1 && (!wizardData.name || !wizardData.projectNumber)) ||
                        (wizardStep === 3 && (!wizardData.dbHost || !wizardData.dbPort || !wizardData.dbName || !wizardData.dbUser || !wizardData.dbPassword))
                      }
                    >
                      {t.next}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleCreateProject}
                      disabled={isCreating}
                      className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          {t.loading}
                        </>
                      ) : (
                        <>
                          <Rocket size={18} />
                          {t.create}
                        </>
                      )}
                    </button>
                  )}
                </div>
             </div>

           </div>
         </div>
      )}

    </div>
  );
};

export default Workbench;
