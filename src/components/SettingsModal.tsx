import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LLMProvider } from '../types';
import { X, Key, LogOut, LogIn, Check, ShieldCheck, Link } from 'lucide-react';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../lib/pkce';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, signInWithGoogle, logout, apiKeys, saveApiKey } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'keys'>('profile');

    if (!isOpen) return null;

    const providers = [
        { id: LLMProvider.GEMINI, name: 'Gemini', description: 'Google DeepMind models' },
        { id: LLMProvider.GROQ, name: 'Groq', description: 'Fast inference for Llama/Mixtral' },
        { id: LLMProvider.DEEPSEEK, name: 'DeepSeek', description: 'Strong reasoning models' },
        { id: LLMProvider.OPENROUTER, name: 'OpenRouter', description: 'Aggregator for many models' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        Settings
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex h-[400px]">
                    {/* Sidebar */}
                    <div className="w-48 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'profile'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-current" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('keys')}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'keys'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Key className="w-4 h-4" />
                            API Keys
                        </button>
                    </div>

                    {/* Main Panel */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900">

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Account</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                        Sign in to sync your preferences and API keys across sessions.
                                    </p>

                                    {!user ? (
                                        <button
                                            onClick={signInWithGoogle}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/25"
                                        >
                                            <LogIn className="w-5 h-5" />
                                            Sign In with Google
                                        </button>
                                    ) : (
                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-4 mb-4">
                                                {user.photoURL && (
                                                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{user.displayName}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium border border-red-200 dark:border-red-900/50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'keys' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">LLM Provider Keys</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                        Enter your own API keys to bypass rate limits and use custom quotas.
                                        Keys are stored securely in your browser's local storage.
                                    </p>

                                    {!user && (
                                        <div className="mb-6 p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 text-sm rounded-lg border border-amber-200 dark:border-amber-800/50">
                                            Sign in to save these keys permanently to your profile. Currently they are temporary.
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {providers.map((provider) => (
                                            <div key={provider.id} className="group">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    {provider.name} <span className="text-xs font-normal text-slate-400">- {provider.description}</span>
                                                </label>

                                                {/* OpenRouter OAuth Special Case */}
                                                {provider.id === LLMProvider.OPENROUTER ? (
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <input
                                                                type="password"
                                                                placeholder="Enter key manually or connect below"
                                                                value={apiKeys[provider.id] || ''}
                                                                onChange={(e) => saveApiKey(provider.id, e.target.value)}
                                                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                                                            />
                                                            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                                            {apiKeys[provider.id] && (
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                                    <Check className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                const codeVerifier = await generateCodeVerifier();
                                                                const codeChallenge = await generateCodeChallenge(codeVerifier);
                                                                const state = generateState();

                                                                localStorage.setItem('openrouter_pkce_verifier', codeVerifier);
                                                                localStorage.setItem('openrouter_pkce_state', state);

                                                                const callbackUrl = `${window.location.origin}/auth/callback`;
                                                                const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callbackUrl)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

                                                                window.location.href = authUrl;
                                                            }}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                                                        >
                                                            <Link className="w-4 h-4" />
                                                            Connect with OpenRouter
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            placeholder={user ? `Enter your ${provider.name} API Key` : "Enter key (Sign in to save)"}
                                                            value={apiKeys[provider.id] || ''}
                                                            onChange={(e) => saveApiKey(provider.id, e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                                                        />
                                                        <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                                        {apiKeys[provider.id] && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
