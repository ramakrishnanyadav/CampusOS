import React, { useState } from 'react';
import { X, ShieldAlert, Lock, ArrowRight, Sparkles, Key } from 'lucide-react';
import { usePermissions } from '../auth/PermissionContext';
import { useTheme } from '../theme/ThemeContext';

export const ElevatedAccessModal: React.FC = () => {
  const { playThemeSound } = useTheme();
  const {
    isElevatedAccessOpen,
    setIsElevatedAccessOpen,
    switchWorkspaceRole,
    pendingCapability,
    setPendingCapability,
  } = usePermissions();

  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isElevatedAccessOpen) return null;

  const handleElevate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    playThemeSound('click');

    try {
      const response = await fetch('/api/auth/elevate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.elevationToken) {
        playThemeSound('success');
        localStorage.setItem('campusos_elevation_token', data.elevationToken);
        switchWorkspaceRole('ADMIN');
        setIsElevatedAccessOpen(false);
        setPendingCapability(null);
      } else {
        setErrorMsg(data.message || 'Invalid administrator credentials.');
        playThemeSound('action');
      }
    } catch (err: any) {
      console.error('Server Elevation Error:', err);
      setErrorMsg('Server connection failed. Could not verify administrator credentials.');
      playThemeSound('action');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto min-h-screen">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-0 relative m-auto">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Administrator Access</h3>
              <p className="text-xs text-purple-100 font-medium">
                This action requires elevated permissions
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playThemeSound('click');
              setIsElevatedAccessOpen(false);
            }}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleElevate} className="p-6 space-y-5 bg-white">
          {pendingCapability && (
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
              <span className="text-slate-500 font-medium block">Requested Capability</span>
              <span className="font-mono font-extrabold text-[#7C3AED] block">
                `{pendingCapability}`
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Administrator Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#7C3AED]/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span>Authenticate Administrator Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
