import React from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { AlertCircle } from 'lucide-react';

export const GoogleConnectView: React.FC = () => {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiFetch<{auth_url: string}>('/api/auth/google/connect');
      window.location.href = res.auth_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0D111C] border border-white/8 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Google Account</h1>
        <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
          Crewmate requires access to your Gmail and Google Calendar to operate as your AI co-founder. 
          Please authorize access to continue.
        </p>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-300 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1842FF] hover:bg-[#2855FF] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? 'Redirecting...' : 'Authorize Google Access'}
          </button>
          
          <button
            onClick={signOut}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
