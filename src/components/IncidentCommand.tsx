import React from "react";
import { CommandAlert } from "../types";
import { useTheme } from "../theme/ThemeContext";
import { ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Activity, ArrowUpRight, Zap } from "lucide-react";

interface IncidentCommandProps {
  alerts: CommandAlert[];
  onResolveAlert: (alertId: string) => void;
  onResetAlerts: () => void;
  onOpenExplainability: (item: any) => void;
}

export const IncidentCommand: React.FC<IncidentCommandProps> = ({
  alerts,
  onResolveAlert,
  onResetAlerts,
  onOpenExplainability,
}) => {
  const { playThemeSound } = useTheme();

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  const handleResolve = (alertId: string) => {
    playThemeSound("success");
    onResolveAlert(alertId);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Campus Status</span>
            <Activity className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#0F172A]">
              {activeAlerts.length === 0 ? "Running Normally" : `${activeAlerts.length} Needs Attention`}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            {activeAlerts.length === 0 ? "No active bottlenecks" : "Staged for review"}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Active Issues</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0F172A] font-mono">{activeAlerts.length}</span>
            <span className="text-xs text-[#F59E0B] font-bold">Active</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Schedule & document items</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0F172A] font-mono">{resolvedAlerts.length}</span>
            <span className="text-xs text-[#10B981] font-bold">Resolved</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Updated in real-time</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-semibold">System Health</span>
            <Zap className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0F172A] font-mono">98.4%</span>
            <span className="text-xs text-[#7C3AED] font-bold">Normal</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Auto-sync active</p>
        </div>
      </div>

      {/* Incident Command Feed */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
              Active Bottlenecks ({activeAlerts.length})
            </h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Items requiring administrative action or approval
            </p>
          </div>

          <button
            onClick={onResetAlerts}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Reset Demo</span>
          </button>
        </div>

        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#0F172A]">No Problems Active</h3>
              <p className="text-xs text-[#64748B] mt-1 font-medium">Everything is running smoothly.</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-[#EF4444] bg-[#EF4444]/10 rounded">
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium">📍 {alert.location}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#0F172A]">{alert.title}</h4>
                  <p className="text-xs text-[#475569] font-medium">{alert.description}</p>

                  <div className="text-xs text-[#64748B] mt-1">
                    AI Suggestion: <span className="text-[#0F172A] font-bold">{alert.actionPrompt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() =>
                      onOpenExplainability({
                        title: alert.title,
                        confidenceScore: 0.96,
                        domain: 'incidents',
                        reasoningBullets: [
                          `Location: ${alert.location}`,
                          `Category: ${alert.category}`,
                          `Trigger: System constraint solver detected overlap`,
                        ],
                        recommendedAction: alert.actionPrompt,
                      })
                    }
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#7C3AED] text-xs font-bold rounded-xl border border-slate-200 transition-all"
                  >
                    How Sure the AI Is
                  </button>

                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md shadow-[#7C3AED]/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Resolve Problem</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
