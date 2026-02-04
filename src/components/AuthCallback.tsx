import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LLMProvider } from '../types';
import { Check, Loader2, XCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { saveApiKey } = useAuth();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Completing authentication...');

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setMessage(`Authentication failed: ${error}`);
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        if (!code) {
            setStatus('error');
            setMessage('No authorization code found.');
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        const exchangeCode = async () => {
            try {
                // In a real PKCE flow, we would verify state and use code_verifier here.
                // However, OpenRouter's simplified flow returns the key directly if configured,
                // OR we exchange the code via their API.

                // For OpenRouter PKCE:
                // POST https://openrouter.ai/api/v1/auth/keys
                // Body: { code, code_verifier, code_challenge_method: 'S256' }

                const codeVerifier = localStorage.getItem('openrouter_pkce_verifier');

                const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code,
                        code_verifier: codeVerifier,
                        code_challenge_method: 'S256',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to exchange code for API key');
                }

                const data = await response.json();

                // Expecting data.key or similar based on OpenRouter API
                if (data.key) {
                    saveApiKey(LLMProvider.OPENROUTER, data.key);
                    setStatus('success');
                    setMessage('Successfully connected to OpenRouter!');
                    localStorage.removeItem('openrouter_pkce_verifier'); // Cleanup

                    setTimeout(() => navigate('/'), 2000);
                } else {
                    throw new Error('Invalid response from OpenRouter');
                }
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setMessage(err.message || 'Failed to connect.');
                setTimeout(() => navigate('/'), 3000);
            }
        };

        exchangeCode();
    }, [searchParams, navigate, saveApiKey]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border border-slate-700">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                        <h2 className="text-xl font-semibold">Connecting...</h2>
                        <p className="text-slate-400">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-green-400">Connected!</h2>
                        <p className="text-slate-400">{message}</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-red-400">Connection Failed</h2>
                        <p className="text-slate-400">{message}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
