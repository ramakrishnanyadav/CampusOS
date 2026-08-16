import React from 'react';
import { X, Sparkles, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AIExplainabilityItem } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface AIExplainabilityModalProps {
  item: AIExplainabilityItem | null;
  onClose: () => void;
  onExecuteAction?: () => void;
}

export const AIExplainabilityModal: React.FC<AIExplainabilityModalProps> = ({
  item,
  onClose,
  onExecuteAction,
}) => {
  const { playThemeSound } = useTheme();

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none min-h-screen">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-0 relative m-auto">
        {/* Header Bar (Crisp Light Theme with Electric Purple Badge) */}
        <div className="bg-slate-50/80 border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#7C3AED] text-white rounded-2xl shadow-md shadow-[#7C3AED]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
                AI Reasoning & Audit Log
              </div>
              <h3 className="font-extrabold text-lg text-[#0F172A] leading-tight">{item.title}</h3>
            </div>
          </div>

          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* Status Badge Strip (No confidence words) */}
          <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-bold">AI Verification Status</span>
            <span className="text-xs text-[#10B981] font-extrabold bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              Validated Logic
            </span>
          </div>

          {/* Reasoning Bullets Section */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#7C3AED]" />
              Why Was This Flagged?
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              {item.reasoningBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Operational Action */}
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
              Recommended Operational Action
            </div>
            <p className="text-xs font-extrabold text-[#0F172A]">{item.recommendedAction}</p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              playThemeSound('success');
              if (onExecuteAction) onExecuteAction();
            }}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>Auto-Resolve Recommendation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
