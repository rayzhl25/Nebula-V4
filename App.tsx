
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Workbench from './components/Workbench';
import ProjectList from './components/ProjectList';
import TemplateList from './components/TemplateList';
import DepartmentList from './components/DepartmentList';
import DeveloperList from './components/DeveloperList';
import RoleList from './components/RoleList';
import OrganizationList from './components/OrganizationList';
import ResourceList from './components/ResourceList';
import ResourceDownloads from './components/ResourceDownloads';
import ProjectDesigner from './components/ProjectDesigner';
import { User, ThemeMode, Language, Tenant } from './types';
import { MOCK_TENANTS, LOCALE } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [lang, setLang] = useState<Language>('zh');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [tenant, setTenant] = useState<Tenant>(MOCK_TENANTS[0]);
  
  // State for the currently open project in Designer mode
  const [currentProject, setCurrentProject] = useState<any | null>(null);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Simple Router Switch
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Workbench lang={lang} user={user!} onOpenProject={setCurrentProject} />;
      case 'projects':
        return <ProjectList lang={lang} onOpenProject={setCurrentProject} />;
      case 'templates':
        return <TemplateList lang={lang} />;
      case 'organizations':
        return <OrganizationList lang={lang} />;
      case 'departments':
        return <DepartmentList lang={lang} />;
      case 'developers':
        return <DeveloperList lang={lang} />;
      case 'roles':
        return <RoleList lang={lang} />;
      case 'resources':
        return <ResourceList lang={lang} />;
      case 'downloads':
        return <ResourceDownloads lang={lang} />;
      default:
        // Placeholder for other modules
        const t = LOCALE[lang];
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 dark:text-gray-500">
             <div className="text-6xl font-bold opacity-10 mb-4">{activeMenu.toUpperCase()}</div>
             <p className="text-xl">Module Under Construction</p>
             <p className="mt-2 text-sm opacity-60">This part of Nebula LowCode is coming soon.</p>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <Login 
        onLogin={setUser} 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
      />
    );
  }

  // If a project is open, show the Designer full screen
  if (currentProject) {
    return (
      <ProjectDesigner 
        project={currentProject} 
        lang={lang} 
        onBack={() => setCurrentProject(null)} 
      />
    );
  }

  return (
    <Layout
      user={user}
      theme={theme}
      setTheme={setTheme}
      lang={lang}
      setLang={setLang}
      onLogout={() => setUser(null)}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      tenant={tenant}
      setTenant={setTenant}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
