import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackComponent?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // Error tracking service integration point (e.g., Sentry, LogRocket)
        // Set up your provider and uncomment the below when ready:
        // if (window.Sentry) {
        //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
        // } else {
        //   console.error("[Fallback Error Tracking]:", error, errorInfo?.componentStack);
        // }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallbackComponent) {
                return this.props.fallbackComponent;
            }

            return (
                <div className="min-h-screen bg-[var(--lumina-bg)] flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Aura for Error */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-red-500/10 blur-[120px] animate-pulse" />

                    <div className="glass-panel max-w-2xl w-full p-10 rounded-[2.5rem] text-center relative z-10 border-red-500/20">
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 rotate-12 hover:rotate-0 transition-transform duration-500">
                                <AlertTriangle className="text-red-400" size={40} />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">System Disruption</h1>
                        <p className="text-slate-400 mb-8 text-lg">
                            Lumina encountered an unexpected anomaly. We've preserved your session data.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left mb-8 bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 group">
                                <summary className="text-sm text-white/40 cursor-pointer mb-3 font-mono hover:text-white transition-colors">
                                    Technical Diagnostics
                                </summary>
                                <pre className="text-xs text-red-300/80 overflow-auto max-h-40 custom-scrollbar">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 font-medium group"
                            >
                                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                                Re-initialize
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-blue-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
                            >
                                Restore System
                            </button>
                        </div>
                    </div>
                </div>
            );

        }

        return this.props.children;
    }
}

export default ErrorBoundary;
