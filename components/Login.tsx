import React, { useState } from 'react';
import { User, Language, ThemeMode } from '../types';
import { login } from '../services/mockService';
import { LOCALE } from '../constants';
import { Sun, Moon, Monitor, Globe } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang, theme, setTheme }) => {
  // Pre-fill default credentials for better user experience
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const t = LOCALE[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username);
      onLogin(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gray-50 dark:bg-gradient-to-br dark:from-nebula-900 dark:via-purple-900 dark:to-black flex items-center justify-center px-4 relative">
      
      {/* Settings Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
         {/* Language Switch */}
         <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="p-2.5 rounded-full bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
            title={lang === 'en' ? 'Switch to Chinese' : 'Switch to English'}
         >
            <Globe size={18} />
         </button>

         {/* Theme Switch */}
         <div className="flex bg-white dark:bg-white/10 rounded-full p-1 shadow-sm border border-gray-200 dark:border-white/10">
             <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'light' ? 'bg-gray-100 dark:bg-white text-yellow-500 shadow-sm' : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white'}`}><Sun size={16} /></button>
             <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'system' ? 'bg-gray-100 dark:bg-white text-nebula-500 shadow-sm' : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white'}`}><Monitor size={16} /></button>
             <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-gray-100 dark:bg-white text-purple-500 shadow-sm' : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white'}`}><Moon size={16} /></button>
         </div>
      </div>

      <div className="bg-white dark:bg-white/10 dark:backdrop-blur-lg border border-gray-200 dark:border-white/20 p-8 rounded-2xl w-full max-w-md shadow-xl dark:shadow-2xl transition-all duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nebula-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-nebula-500/30">
            N
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nebula LowCode</h1>
          <p className="text-gray-500 dark:text-gray-300">{t.loginDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.username}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-nebula-500 focus:border-transparent outline-none transition-all"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-nebula-500 focus:border-transparent outline-none transition-all"
              placeholder="123456"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nebula-600 hover:bg-nebula-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-nebula-600/30 dark:shadow-nebula-900/50 flex items-center justify-center"
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span> : t.login}
          </button>
          
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
             Default: admin / 123456
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;