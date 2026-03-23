import React, { createContext, useContext, useEffect, useState } from 'react';
import { LLMProvider } from '../types';

export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    apiKeys: Record<string, string>;
    saveApiKey: (provider: string, key: string) => void;
    getApiKey: (provider: string) => string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

    useEffect(() => {
        // Mock auth persistence
        const storedUser = localStorage.getItem('lumina_guest_user');
        if (storedUser) {
            const guest = JSON.parse(storedUser);
            setUser(guest);
            loadKeys(guest.uid);
        }
        setLoading(false);
    }, []);

    const loadKeys = (uid: string) => {
        const storedKeys = localStorage.getItem(`lumina_keys_${uid}`);
        if (storedKeys) {
            setApiKeys(JSON.parse(storedKeys));
        } else {
            setApiKeys({});
        }
    };

    const signInWithGoogle = async () => {
        // Mock sign-in process
        const guestUser = {
            uid: 'guest-' + Math.random().toString(36).substr(2, 9),
            displayName: 'Guest Researcher',
            email: 'guest@lumina.ai',
            photoURL: null
        };
        setUser(guestUser);
        localStorage.setItem('lumina_guest_user', JSON.stringify(guestUser));
        loadKeys(guestUser.uid);
    };

    const logout = async () => {
        setUser(null);
        setApiKeys({});
        localStorage.removeItem('lumina_guest_user');
    };

    const saveApiKey = (provider: string, key: string) => {
        if (!user) return;
        const newKeys = { ...apiKeys, [provider]: key };
        setApiKeys(newKeys);
        localStorage.setItem(`lumina_keys_${user.uid}`, JSON.stringify(newKeys));
    };

    const getApiKey = (provider: string): string => {
        if (apiKeys[provider]) return apiKeys[provider];

        const envKeyMap: Record<string, string> = {
            [LLMProvider.GEMINI]: import.meta.env.VITE_GEMINI_API_KEY,
            [LLMProvider.GROQ]: import.meta.env.VITE_GROQ_API_KEY,
            [LLMProvider.DEEPSEEK]: import.meta.env.VITE_DEEPSEEK_API_KEY,
            [LLMProvider.OPENROUTER]: import.meta.env.VITE_OPENROUTER_API_KEY,
        };
        return envKeyMap[provider] || "";
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, apiKeys, saveApiKey, getApiKey }}>
            {children}
        </AuthContext.Provider>
    );
};
