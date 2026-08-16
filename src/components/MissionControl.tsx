import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldAlert, Cpu, Eye, Check, Play, CheckCircle2, AlertTriangle, Users, Calendar, FileText, ChevronRight } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useAIRuntime } from '../ai/runtime/AIRuntimeContext';
import { useCampusStore } from '../context/CampusStoreContext';
import { VideoShowcaseModal } from './VideoShowcaseModal';
import { ConnectedEcosystemPillars } from './ConnectedEcosystemPillars';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface MissionControlProps {
  unresolvedAlertCount: number;
  onReviewIssues: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  unresolvedAlertCount,
  onReviewIssues,
  onNavigateTab,
}) => {
  const { playThemeSound } = useTheme();
  const { recommendations, acceptRecommendation, openExplainability } = useAIRuntime();
  const { alerts, students, slots, extractedDocs, resolveAlert } = useCampusStore();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const pendingRecommendations = recommendations.filter((r) => r.status === 'Pending');
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const attendancePercentage = Math.round((presentCount / (students.length || 1)) * 100);
  const conflictCount = slots.filter((s) => s.isConflict).length;

  return (
    <div className="space-y-8 mb-8 select-none">
      <VideoShowcaseModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />

      {/* 1. HERO SECTION: Dominant Hero Banner Above Everything */}
      <div className="glass-panel bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white p-8 lg:p-10 rounded-[28px] shadow-2xl shadow-[#7C3AED]/25 relative overflow-hidden flex flex-col justify-between space-y-6">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="demo" className="bg-white/15 text-amber-300 border-white/20">
              <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
              CampusOS Operational Intelligence
            </Badge>
            <Badge variant="warning" className="bg-amber-400 text-slate-950 border-amber-300">
              Live AI Mode
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome Back, Dr. Aris Vance
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl font-medium">
            <strong className="text-white underline">{unresolvedAlerts.length} operational issues</strong> and{' '}
            <strong className="text-white underline">{pendingRecommendations.length} AI recommendations</strong> need your attention today.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3 relative z-10">
          <Button
            variant="primary"
            size="lg"
            className="bg-white text-[#6D28D9] hover:bg-purple-50 shadow-xl"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              onReviewIssues();
              playThemeSound('action');
            }}
          >
            Review {unresolvedAlerts.length} Operational Bottlenecks
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg border-0"
            leftIcon={<Play className="w-4 h-4 text-slate-950 fill-slate-950" />}
            onClick={() => {
              setIsVideoModalOpen(true);
              playThemeSound('click');
            }}
          >
            Watch System Video Walkthrough
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/10"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() =>
              openExplainability({
                title: 'CampusOS Autonomous Operational Reasoning Engine',
                confidenceScore: 0.984,
                domain: 'ai',
                reasoningBullets: [
                  'Ingested real-time attendance gate telemetry across 3 entrance checkpoints.',
                  'Evaluated teacher availability and room capacity constraints using CSP solver.',
                  'Synthesized proactive staffing risk alerts for Friday afternoon dip.',
                ],
                recommendedAction: 'Execute auto-scheduler to re-assign substitute Dr. Sarah Jenkins',
              })
            }
          >
            Inspect AI Reasoning Log
          </Button>
        </div>
      </div>

      {/* 2. TODAY'S PROBLEMS (Command Alerts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-2xl font-extrabold text-[#0F172A]">Today's Operational Problems</h2>
          </div>
          <Badge variant="critical">{unresolvedAlerts.length} Unresolved</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unresolvedAlerts.map((alert) => (
            <Card key={alert.id} variant="borderless" className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={alert.severity === 'critical' ? 'critical' : 'warning'}>
                    {alert.category}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400">{alert.location}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{alert.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600">+{alert.xpReward} XP Resolution Reward</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    resolveAlert(alert.id);
                    playThemeSound('success');
                  }}
                >
                  Resolve Alert
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. AI RECOMMENDATIONS CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h2 className="text-2xl font-extrabold text-[#0F172A]">AI Proactive Recommendations</h2>
          </div>
          <Badge variant="purple">{pendingRecommendations.length} Staged</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {pendingRecommendations.slice(0, 3).map((rec) => (
            <Card key={rec.id} variant="glass" className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{rec.domain}</Badge>
                  <span className="text-[11px] font-mono font-bold text-emerald-600">
                    {Math.round(rec.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{rec.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{rec.actionPrompt}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <Button
                  variant="success"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => {
                    acceptRecommendation(rec.id);
                    playThemeSound('success');
                  }}
                >
                  Approve
                </Button>
                {/* Reject is not wired in AIRuntimeContextType — placeholder removed */}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="borderless" className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{attendancePercentage}%</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="borderless" className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timetable Conflicts</span>
            <div className="text-2xl font-extrabold text-[#0F172A] mt-1 font-mono">{conflictCount}</div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="borderless" className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OCR Records</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{extractedDocs.length}</div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </Card>

        <Card variant="borderless" className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Autonomous Solves</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">28/30</div>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* 5. ECOSYSTEM PILLARS / MODULES GRID */}
      <ConnectedEcosystemPillars onNavigateTab={onNavigateTab} />
    </div>
  );
};
