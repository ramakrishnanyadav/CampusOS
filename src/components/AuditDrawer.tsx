import React, { useState } from 'react';
import { X, Search, Download, ShieldCheck, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { serviceContainer } from '../services/container/ServiceContainer';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ isOpen, onClose }) => {
  const { playThemeSound } = useTheme();
  const auditService = serviceContainer.getAuditService();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const records = auditService.searchLogs({
    query: searchQuery,
    role: roleFilter || undefined,
  });

  const handleExportCSV = () => {
    playThemeSound('success');
    const csvData = auditService.exportCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusos_audit_trail_${Date.now()}.csv`;
    a.click();
    setDownloadSuccess('Exported Audit Log to CSV');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportJSON = () => {
    playThemeSound('success');
    const jsonData = auditService.exportJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusos_audit_trail_${Date.now()}.json`;
    a.click();
    setDownloadSuccess('Exported Audit Log to JSON');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">

      <div className="bg-white border-l border-slate-200 w-full max-w-2xl h-full overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white p-6 relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Enterprise Audit Log Service</h3>
              <p className="text-xs text-purple-100 font-medium">
                Immutable domain activity trail with query, search & export
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Export Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search actor, action, IP, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Audit Log Table (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {records.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs font-medium">
              No audit log records match query "{searchQuery}".
            </div>
          ) : (
            records.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-sm hover:border-[#7C3AED] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0F172A]">{r.actorName}</span>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 bg-purple-100 text-[#7C3AED] rounded-md">
                      {r.role}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{r.timestamp}</span>
                </div>

                <div className="text-xs font-semibold text-slate-700">{r.action}</div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Resource: {r.targetResource}</span>
                  <span>IP: {r.ipAddress}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
