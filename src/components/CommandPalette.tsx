import React, { useState, useEffect } from 'react';
import { Search, X, ShieldAlert, FileText, Calendar, Users, BarChart3, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { usePermissions, Capability } from '../auth/PermissionContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onRunOCR: () => void;
  onResolveConflicts: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onRunOCR,
  onResolveConflicts,
}) => {
  const { playThemeSound } = useTheme();
  const { hasCapability } = usePermissions();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandItems: Array<{
    id: string;
    title: string;
    desc: string;
    icon: any;
    action: () => void;
    category: string;
    capabilityNeeded: Capability;
  }> = [
    {
      id: 'incidents',
      title: 'Review Active Incidents & Bottlenecks',
      desc: 'Jump to main command briefing and staged AI recommendations',
      icon: ShieldAlert,
      action: () => onNavigateTab('incidents'),
      category: 'Navigation',
      capabilityNeeded: Capability.INCIDENT_MANAGE,
    },
    {
      id: 'ocr',
      title: 'Run AI Document OCR & Multilingual Parsing',
      desc: 'Extract paper admission forms in Hindi, Marathi, Spanish, English',
      icon: FileText,
      action: onRunOCR,
      category: 'Document AI',
      capabilityNeeded: Capability.OCR_WRITE,
    },
    {
      id: 'solver',
      title: 'Run Timetable Conflict Auto-Solver',
      desc: 'Fix AP Physics Room 302 double-bookings and reassign teachers',
      icon: Calendar,
      action: onResolveConflicts,
      category: 'Scheduling AI',
      capabilityNeeded: Capability.TIMETABLE_SOLVE,
    },
    {
      id: 'attendance',
      title: 'View Spatial Gate Attendance Roster',
      desc: 'Check live RFID gate check-ins for Gate 1, 2, and 3',
      icon: Users,
      action: () => onNavigateTab('attendance'),
      category: 'Gate Access',
      capabilityNeeded: Capability.ATTENDANCE_READ,
    },
    {
      id: 'analytics',
      title: 'View Staffing & Substitute Analytics',
      desc: 'Inspect teacher absence probability & pre-allocated sub pool',
      icon: BarChart3,
      action: () => onNavigateTab('analytics'),
      category: 'HR Intelligence',
      capabilityNeeded: Capability.STAFFING_WRITE,
    },
  ];

  const allowedItems = commandItems.filter((item) => hasCapability(item.capabilityNeeded));

  const filteredItems = allowedItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open command palette handled at parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 select-none">
        {/* Search Input Bar (Clean Light Theme) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#7C3AED]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search roster, run action, or Ask AI (e.g. 'Which classrooms are free?')"
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Results List */}
        <div className="p-2 max-h-[380px] overflow-y-auto space-y-1 bg-white">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED] flex items-center justify-between">
            <span>Suggested Actions & Navigation</span>
            <Sparkles className="w-3 h-3 text-[#7C3AED]" />
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playThemeSound('action');
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 shadow-sm'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isSelected ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#7C3AED] flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>Use ESC to exit</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3.5 h-3.5 text-[#7C3AED]" /> Select Action
            </span>
          </div>
          <kbd className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold shadow-sm">
            ⌘K Command Palette
          </kbd>
        </div>
      </div>
    </div>
  );
};
