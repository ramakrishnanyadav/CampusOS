import React from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Sparkles, Film, Play, ExternalLink } from 'lucide-react';
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

        {/* Video Player & Poster Showcase Container */}
        <div className="relative bg-slate-950 flex-1 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[460px] overflow-hidden p-4 sm:p-6 text-center">
          <div className="relative max-w-4xl w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900">
            <img
              src="/images/cartoon_school_poster.png"
              alt="CampusOS Operational Intelligence Showcase"
              className="w-full h-auto max-h-[58vh] object-cover rounded-3xl brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col items-center justify-center p-6 space-y-5">
              <a
                href="https://github.com/ramakrishnanyadav/CampusOS/releases/download/v1.0.0/CampusOs.mp4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playThemeSound('success')}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full flex items-center justify-center shadow-2xl shadow-amber-400/50 hover:scale-110 active:scale-95 transition-all duration-300 group/btn"
              >
                <Play className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950 fill-slate-950 ml-1.5 group-hover/btn:scale-110 transition-transform" />
              </a>

              <div className="space-y-1.5 max-w-lg">
                <h4 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  Click to Watch 1:45 HD Video Tour
                </h4>
                <p className="text-xs sm:text-sm text-purple-200 font-medium">
                  Plays official HD video presentation with audio (CampusOs.mp4)
                </p>
              </div>

              <a
                href="https://github.com/ramakrishnanyadav/CampusOS/releases/download/v1.0.0/CampusOs.mp4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playThemeSound('success')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>▶️ Launch Fullscreen Video Player</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Status Rail */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-semibold text-white">CampusOS Intelligence System Demo</span>
          </div>

          <a
            href="https://github.com/ramakrishnanyadav/CampusOS/releases/download/v1.0.0/CampusOs.mp4"
            target="_blank"
            rel="noopener noreferrer"
            className="font-extrabold text-white text-xs bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded-full border border-purple-400/30 transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>▶️ Stream HD Video Directly</span>
          </a>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
