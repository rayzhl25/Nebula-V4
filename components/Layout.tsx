
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Moon, 
  Sun, 
  Globe, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Monitor,
  Lock,
  Info
} from 'lucide-react';
import { MENUS, LOCALE, MOCK_TENANTS } from '../constants';
import { ThemeMode, Language, Tenant, User, MenuItem } from '../types';
import { ChangePasswordModal, AboutModal } from './project/ActionModals';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onLogout: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  tenant: Tenant;
  setTenant: (t: Tenant) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children, user, theme, setTheme, lang, setLang, onLogout, activeMenu, setActiveMenu, tenant, setTenant
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['resources']);
  
  // Modal states
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  
  const t = LOCALE[lang];

  const toggleMenuExpand = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = activeMenu === item.id;
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenuExpand(item.id);
            } else {
              setActiveMenu(item.id);
            }
          }}
          className={`w-full flex items-center justify-between p-3 my-1 rounded-lg transition-colors ${
            isActive ? 'bg-nebula-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 1 + 0.75}rem` }}
        >
          <div className="flex items-center gap-3">
            <item.icon size={20} />
            {sidebarOpen && <span>{t[item.labelKey as keyof typeof t]}</span>}
          </div>
          {sidebarOpen && hasChildren && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="ml-2 border-l-2 border-gray-200 dark:border-gray-700">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
           <div className="w-8 h-8 bg-nebula-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">
             N
           </div>
           {sidebarOpen && <span className="font-bold text-lg text-gray-800 dark:text-white">Nebula</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {MENUS.map(menu => renderMenuItem(menu))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4">
            {/* Tenant Switcher */}
            <div className="relative group">
               <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                 <span className="w-6 h-6 bg-nebula-500 rounded-full flex items-center justify-center text-xs text-white">{tenant.logo}</span>
                 {tenant.name}
                 <ChevronDown size={14} />
               </button>
               {/* Transparent bridge (pt-2) ensures hover state isn't lost when moving to dropdown */}
               <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1">
                     {MOCK_TENANTS.map(t => (
                       <button 
                        key={t.id}
                        onClick={() => setTenant(t)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-nebula-50 dark:hover:bg-nebula-900/30 rounded-md"
                       >
                         {t.name}
                       </button>
                     ))}
                   </div>
               </div>
            </div>

            {/* Language */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              title={t.language}
            >
              <Globe size={20} />
            </button>

            {/* Theme */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
               <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full ${theme === 'light' ? 'bg-white shadow text-yellow-500' : 'text-gray-500'}`}><Sun size={14} /></button>
               <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full ${theme === 'system' ? 'bg-white shadow text-nebula-500' : 'text-gray-500'}`}><Monitor size={14} /></button>
               <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full ${theme === 'dark' ? 'bg-white shadow text-purple-400' : 'text-gray-500'}`}><Moon size={14} /></button>
            </div>

            {/* User Profile & Logout - Modified */}
            <div className="flex items-center gap-3 border-l border-gray-300 dark:border-gray-600 pl-4 ml-2">
              {/* User Dropdown Trigger */}
              <div className="relative group/user">
                  <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{user.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover/user:block z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1">
                          <button 
                            onClick={() => setIsPwdModalOpen(true)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center gap-2"
                          >
                            <Lock size={14} /> {t.changePassword}
                          </button>
                          <button 
                            onClick={() => setIsAboutModalOpen(true)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center gap-2"
                          >
                            <Info size={14} /> {t.aboutUs}
                          </button>
                      </div>
                  </div>
              </div>

              {/* Standalone Logout Button (Kept in position as requested) */}
              <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full" title={t.logout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 text-gray-800 dark:text-gray-200">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <ChangePasswordModal 
        isOpen={isPwdModalOpen}
        onClose={() => setIsPwdModalOpen(false)}
        lang={lang}
      />
      <AboutModal 
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};

export default Layout;
