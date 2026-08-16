import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  undoAction?: () => void;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-purple-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    error: 'border-rose-500/30',
    info: 'border-purple-500/30',
  };

  return (
    <div
      className={`glass-panel bg-white/90 backdrop-blur-xl border ${borderColors[toast.type]} p-4 rounded-2xl shadow-2xl flex items-start gap-3 w-80 animate-in slide-in-from-right duration-300 pointer-events-auto`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-extrabold text-slate-900">{toast.title}</h4>
        <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed truncate">
          {toast.message}
        </p>
        {toast.undoAction && (
          <button
            onClick={toast.undoAction}
            className="mt-2 text-[11px] font-extrabold text-purple-600 hover:text-purple-700 underline"
          >
            Undo Change
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
