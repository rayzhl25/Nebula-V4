
import React, { useState, useEffect } from 'react';
import { Copy, Key, LayoutTemplate, Loader2, Check, Lock, ShieldCheck, X, AlertCircle, Info } from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language, SystemInfo } from '../../types';
import { copyProject, createTemplate, changePassword, getSystemInfo } from '../../services/mockService';

interface CopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  lang: Language;
  onSuccess: (newProject: any) => void;
}

/**
 * 复制项目确认弹窗 (CopyModal)
 */
export const CopyModal: React.FC<CopyModalProps> = ({ isOpen, onClose, project, lang, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const t = LOCALE[lang];

  if (!isOpen || !project) return null;

  const handleCopy = async () => {
      setLoading(true);
      try {
          await copyProject(project.id);
          // 模拟复制后的项目数据
          const copiedProject = {
            ...project,
            id: Date.now(),
            name: `${project.name} - Copy`,
            number: `${project.number}-CP`,
            lastEdited: 'Just now',
            status: 'In Progress' 
          };
          onSuccess(copiedProject);
          onClose();
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-nebula-100 dark:bg-nebula-900/30 flex items-center justify-center text-nebula-600 dark:text-nebula-400"><Copy size={24} /></div>
                    <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.createProjectTitle.replace('Create New', 'Copy')}</h3></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t.copyConfirm}</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="font-medium text-gray-800 dark:text-white">{project.name}</span></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">{t.cancel}</button>
                <button onClick={handleCopy} disabled={loading} className="px-4 py-2 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-nebula-600/20">{loading ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}{t.copy}</button>
            </div>
        </div>
    </div>
  );
};

interface KeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    lang: Language;
    accessKey: string;
}

/**
 * 项目密钥查看弹窗 (KeyModal)
 */
export const KeyModal: React.FC<KeyModalProps> = ({ isOpen, onClose, project, lang, accessKey }) => {
    const t = LOCALE[lang];
    const [copied, setCopied] = useState(false);

    if (!isOpen || !project) return null;

    // 复制密钥到剪贴板
    const copyToClipboard = () => {
        navigator.clipboard.writeText(accessKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><Key size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.projectKey}</h3><p className="text-sm text-gray-500">{project.name}</p></div>
                </div>
                <div className="relative">
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-700 dark:text-gray-300 break-all pr-12">{accessKey}</div>
                   <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 transition-colors" title={t.copyKey}>{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}</button>
                </div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors">{t.close}</button>
             </div>
          </div>
        </div>
    );
};

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    lang: Language;
}

/**
 * 发布为模板确认弹窗 (PublishModal)
 */
export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, project, lang }) => {
    const t = LOCALE[lang];
    const [loading, setLoading] = useState(false);

    if (!isOpen || !project) return null;

    const handlePublish = async () => {
        setLoading(true);
        try {
            await createTemplate({
                name: project.name,
                desc: project.desc,
                category: 'catGeneral',
                tags: ['Project', 'Custom'],
                type: 'custom'
            });
            alert(t.publishSuccess);
            onClose();
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><LayoutTemplate size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.confirmPublish}</h3></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t.publishTemplateConfirm}</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="font-medium text-gray-800 dark:text-white">{project.name}</span></div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">{t.cancel}</button>
                <button onClick={handlePublish} disabled={loading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20">{loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}{t.confirmPublish}</button>
             </div>
          </div>
        </div>
    );
};

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

/**
 * 修改密码弹窗组件 (ChangePasswordModal)
 */
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, lang }) => {
    const t = LOCALE[lang];
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // 基础校验
        if (formData.newPassword !== formData.confirmPassword) {
            setError(t.passwordMismatch);
            return;
        }
        if (formData.newPassword.length < 6) {
            setError(lang === 'zh' ? '新密码长度不能少于6位' : 'New password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await changePassword(formData.oldPassword, formData.newPassword);
            alert(t.passwordSuccess);
            onClose();
        } catch (err: any) {
            setError(t.passwordError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* 头部标题 - 采用深蓝色系增强安全感 */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white relative flex-shrink-0 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Lock size={20} className="text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{t.changePassword}</h2>
                            <p className="text-xs text-slate-300 opacity-80">Update your security credentials</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* 表单内容区 */}
                <form onSubmit={handleUpdate} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="space-y-5">
                        {/* 错误提示 */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* 当前密码 */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.oldPassword}</label>
                            <input 
                                type="password" 
                                required
                                value={formData.oldPassword}
                                onChange={e => setFormData({...formData, oldPassword: e.target.value})}
                                placeholder={t.oldPasswordPlaceholder}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none transition-all"
                            />
                        </div>

                        {/* 分割线 */}
                        <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

                        {/* 新密码 */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.newPassword}</label>
                            <input 
                                type="password" 
                                required
                                value={formData.newPassword}
                                onChange={e => setFormData({...formData, newPassword: e.target.value})}
                                placeholder={t.newPasswordPlaceholder}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none transition-all"
                            />
                        </div>

                        {/* 确认新密码 */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.confirmPassword}</label>
                            <input 
                                type="password" 
                                required
                                value={formData.confirmPassword}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                placeholder={t.confirmPasswordPlaceholder}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none transition-all"
                            />
                        </div>

                        {/* 安全提示 */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed flex gap-2">
                            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                            {t.passwordRequirement}
                        </div>
                    </div>

                    {/* 底部操作按钮 */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-slate-800 dark:bg-nebula-600 text-white hover:opacity-90 font-medium flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                            {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

/**
 * 关于我们弹窗 (AboutModal)
 * 展示产品版本、有效期等信息。
 */
export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, lang }) => {
    const t = LOCALE[lang];
    const [info, setInfo] = useState<SystemInfo | null>(null);

    useEffect(() => {
        if (isOpen) {
            getSystemInfo().then(setInfo);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col relative">
                
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 pt-12 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8">{t.aboutUs}</h2>
                    
                    <div className="flex items-center gap-4 mb-8">
                        {/* Logo and Name */}
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-nebula-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-nebula-500/30">
                                <span className="transform -rotate-12 inline-block">N</span>
                            </div>
                            <span className="text-3xl font-bold text-nebula-800 dark:text-white tracking-tight">{t.productName}</span>
                        </div>
                        
                        {/* Badge */}
                        <div className="ml-auto">
                            <span className="bg-nebula-600 text-white px-3 py-1 rounded text-sm font-medium shadow-sm">
                                {info?.edition || 'Loading...'}
                            </span>
                        </div>
                    </div>

                    {/* Info Rows */}
                    <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{t.productVersion}</span>
                            <span className="text-gray-700 dark:text-gray-200 font-mono">{info?.version || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{t.serviceValidUntil}</span>
                            <span className="text-gray-700 dark:text-gray-200 font-mono">{info?.serviceValidUntil || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{t.licenseValidUntil}</span>
                            <span className="text-gray-700 dark:text-gray-200 font-mono">{info?.licenseValidUntil || 'Loading...'}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {info?.copyright || t.copyright}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
