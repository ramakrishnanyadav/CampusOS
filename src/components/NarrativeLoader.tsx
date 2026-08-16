import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';
import { useAIRuntime } from '../ai/runtime/AIRuntimeContext';

export const NarrativeLoader: React.FC = () => {
  const { isNarrating, currentNarrationStep } = useAIRuntime();

  if (!isNarrating) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#111827]/95 backdrop-blur-2xl border border-sky-500/40 rounded-full shadow-2xl shadow-sky-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 text-xs">
      <div className="p-1 bg-sky-500/20 rounded-full text-sky-400">
        <Cpu className="w-4 h-4 animate-spin text-sky-300" />
      </div>
      <span className="text-[#F8FAFC] font-semibold font-mono tracking-wide">
        {currentNarrationStep || 'CampusOS Intelligence Processing...'}
      </span>
      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
    </div>
  );
};
