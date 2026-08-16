import React from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Sparkles, Film } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface VideoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoShowcaseModal: React.FC<VideoShowcaseModalProps> = ({ isOpen, onClose }) => {
  const { playThemeSound } = useTheme();

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 min-h-screen">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl space-y-0 select-none relative m-auto text-white flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight text-white flex items-center gap-2">
                CampusOS — Product Video Overview & AI Demonstration
              </h3>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Full Official Product Video Presentation</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-all"
            title="Close Video Showcase"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-[350px] sm:min-h-[460px] overflow-hidden p-2">
          <video
            src="/CampusOs.mp4"
            controls
            autoPlay
            playsInline
            className="w-full h-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
          >
            <source src="/CampusOs.mp4" type="video/mp4" />
            <source src="/images/CampusOs.mp4" type="video/mp4" />
            Your browser does not support playing MP4 videos.
          </video>
        </div>

        {/* Bottom Status Rail */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-semibold text-white">CampusOS Intelligence System Demo</span>
          </div>

          <span className="font-mono text-purple-300 text-[11px] bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30">
            CampusOs.mp4
          </span>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
