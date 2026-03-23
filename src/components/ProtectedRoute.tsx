import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-4 animate-pulse">
                    <ShieldAlert className="text-blue-500 animate-bounce" size={32} />
                    <p className="text-slate-400 font-medium">Verifying Credentials...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect them to the landing page, but save the current location they were trying to go to
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
