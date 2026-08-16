import React from 'react';
import { Sparkles, Activity, Cpu } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface AIActivityEngineProps {
  statusText: string;
  isProcessing: boolean;
  activeDomain?: 'ai' | 'ocr' | 'scheduling' | 'attendance' | 'staffing' | 'incidents';
}

export const AIActivityEngine: React.FC<AIActivityEngineProps> = ({
  statusText,
  isProcessing,
  activeDomain = 'ai',
}) => {
  const { tokens, themeMode } = useTheme();

  if (themeMode === 'voxel') {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-[#1a1a1a] border-2 border-black p-2 px-3 flex items-center gap-2 font-mono text-xs shadow-[2px_2px_0_#000]">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
        <span className="text-yellow-300 font-bold">{statusText || 'AI Nervous System Active'}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 select-none pointer-events-auto">
      {/* SVG Connecting Pulse Path if processing */}
      {isProcessing && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#111827]/90 backdrop-blur-xl border border-sky-500/40 rounded-full text-xs text-sky-300 shadow-xl shadow-sky-500/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Cpu className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span className="font-medium text-[11px]">{statusText}</span>
        </div>
      )}

      {/* Main AI Indicator Engine Button */}
      <div
        className={`relative w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-xl ${
          isProcessing
            ? 'bg-sky-500/20 border-sky-400 shadow-sky-500/30 scale-105'
            : 'bg-[#111827] border-white/10 hover:border-sky-500/50 shadow-black/40'
        }`}
        title="CampusOS AI Nervous System"
      >
        {/* CSS Breathing Ring */}
        <span
          className={`absolute inset-0 rounded-full border border-sky-400/40 transition-transform ${
            isProcessing ? 'animate-ping' : 'animate-pulse'
          }`}
        />

        <Sparkles className={`w-5 h-5 transition-colors ${isProcessing ? 'text-sky-300 animate-spin' : 'text-sky-400'}`} />

        {/* Small live dot indicator */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#060B15] rounded-full shadow-[0_0_8px_#10B981]" />
      </div>
    </div>
  );
};
