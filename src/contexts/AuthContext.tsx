import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LLMProvider } from '../types';

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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // Load keys for this user
                const storedKeys = localStorage.getItem(`lumina_keys_${currentUser.uid}`);
                if (storedKeys) {
                    setApiKeys(JSON.parse(storedKeys));
                } else {
                    setApiKeys({});
                }
            } else {
                setApiKeys({});
            }
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const saveApiKey = (provider: string, key: string) => {
        if (!user) return;

        // Validate provider against enum? Optional but good practice.

        const newKeys = { ...apiKeys, [provider]: key };
        setApiKeys(newKeys);
        localStorage.setItem(`lumina_keys_${user.uid}`, JSON.stringify(newKeys));
    };

    const getApiKey = (provider: string): string => {
        // 1. Check User Custom Key
        if (apiKeys[provider]) {
            return apiKeys[provider];
        }

        // 2. Fallback to System Key (VITE_...)
        // Mapping provider enum/string to env var
        // GEMINI -> VITE_GEMINI_API_KEY
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
            {!loading && children}
        </AuthContext.Provider>
    );
};
