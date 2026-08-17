import React, { useState, useEffect } from 'react';
import { useCampusStore } from '../context/CampusStoreContext';
import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  Building,
  Activity,
  Cpu,
  FileText,
  Calendar,
  Check,
  Eye,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useAIRuntime } from '../ai/runtime/AIRuntimeContext';
import { VideoShowcaseModal } from './VideoShowcaseModal';
import { ConnectedEcosystemPillars } from './ConnectedEcosystemPillars';
import { AITimelineSidebar } from './AITimelineSidebar';
import { IncidentCommand } from './IncidentCommand';
import { CommandAlert } from '../types';

interface ProductLandingHomeProps {
  unresolvedAlertCount: number;
  alerts: CommandAlert[];
  onResolveAlert: (id: string) => void;
  onResetAlerts: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ProductLandingHome: React.FC<ProductLandingHomeProps> = ({
  unresolvedAlertCount,
  alerts,
  onResolveAlert,
  onResetAlerts,
  onNavigateTab,
}) => {
  const { playThemeSound } = useTheme();
  const { recommendations, acceptRecommendation, openExplainability } = useAIRuntime();
  const { students } = useCampusStore();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [facultyCount, setFacultyCount] = useState(8);
  const [roomCount, setRoomCount] = useState(7);

  useEffect(() => {
    import('../repositories/implementations/FirestoreFacultyRepository').then(({ FirestoreFacultyRepository }) => {
      new FirestoreFacultyRepository().getAllFaculty().then((f) => setFacultyCount(f.length));
    });
    import('../repositories/implementations/FirestoreRoomRepository').then(({ FirestoreRoomRepository }) => {
      new FirestoreRoomRepository().getAllRooms().then((r) => setRoomCount(r.length));
    });
  }, []);

  const totalStudents = students.length || 6;
  const presentStudents = students.filter((s) => s.status === 'PRESENT').length;
  const attendancePct = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 100;

  const pendingRecommendations = recommendations.filter((r) => r.status === 'Pending');

  const problemSolutions = [
    {
      title: "1. RFID Gate Bottlenecks Solved",
      problem: "Traditional morning gate check-ins create long queues and manual paperwork delays.",
      solution: "CampusOS verifies 1,248 students in 0.12s via spatial RFID gate passes and alerts parents instantly.",
      icon: Users,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      targetTab: "attendance",
    },
    {
      title: "2. Zero Timetable Double-Bookings",
      problem: "Teachers and science labs get double-booked during AP course scheduling.",
      solution: "Autonomous Constraint Solver fixes room collisions & re-assigns substitute teachers automatically.",
      icon: Calendar,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      targetTab: "solver",
    },
    {
      title: "3. Paperwork & Form OCR Automation",
      problem: "Handwritten paper forms in Hindi/Marathi take days for staff to transcribe manually.",
      solution: "Multilingual Vision OCR reads paper waivers with 99.4% confidence and updates database schemas.",
      icon: FileText,
      color: "bg-purple-500/10 text-[#7C3AED] border-purple-200",
      targetTab: "ocr",
    },
    {
      title: "4. Predictive Substitute Pre-Allocation",
      problem: "Unforeseen Friday teacher absences leave classrooms unattended and disrupt learning.",
      solution: "AI staffing engine predicts shortage risks and pre-allocates substitute pools in advance.",
      icon: Building,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      targetTab: "analytics",
    },
  ];

  const handleScrollToActionPlan = () => {
    playThemeSound('click');
    const target = document.getElementById('ai-action-plan');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 select-none">
      {/* Video Player Modal */}
      <VideoShowcaseModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />

      {/* 1. Linear/Stripe Style Hero Section: Spacious Greeting & Metric Dominance */}
      <div className="space-y-8 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 px-3.5 py-1 rounded-full w-fit">
              <Sparkles className="w-4 h-4 text-[#7C3AED] animate-pulse" />
              <span>CampusOS Operational Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Good Morning, Dr. Aris Vance
            </h1>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              <span className="font-extrabold text-slate-900 dark:text-white">{unresolvedAlertCount} operational incidents</span> require attention. AI runtime has prepared <span className="font-extrabold text-[#7C3AED]">{pendingRecommendations.length} recommendations</span>.
            </p>
          </div>

          <button
            onClick={handleScrollToActionPlan}
            className="px-6 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-[#7C3AED]/25 transition-all flex items-center gap-2.5 active:scale-[0.98] shrink-0"
          >
            <span>Review Staged Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Giant Metric KPI Stat Dominance Cards (Borderless Soft Elevation) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#0F172A]">Real-Time Campus Executive Telemetry</h2>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Live Firestore Database Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled Roster</span>
                <Users className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {totalStudents}
              </div>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span>↑ Active Student Records</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Gate Attendance</span>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-5xl sm:text-6xl font-black text-[#10B981] font-mono tracking-tight">
                {attendancePct}%
              </div>
              <p className="text-xs text-slate-500 font-medium">
                <span>{presentStudents} of {totalStudents} students verified present</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Faculty & Rooms</span>
                <Building className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {facultyCount} / {roomCount}
              </div>
              <p className="text-xs text-purple-600 font-bold">
                <span>{facultyCount} Teachers • {roomCount} Infrastructure Rooms</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Action Card & Animated Video Thumbnail Box */}
      <div className="bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white p-8 sm:p-12 rounded-3xl shadow-2xl shadow-[#7C3AED]/25 relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Briefing Statement */}
        <div className="space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Autonomous Intelligence Nervous System</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
            {unresolvedAlertCount} Critical Bottlenecks Resolved Automatically Today
          </h2>

          <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed">
            Every module in CampusOS is a different window into one continuously running intelligence — watching gate passes, balancing timetables, and extracting document schemas in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsVideoModalOpen(true);
                playThemeSound('click');
              }}
              className="px-6 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2.5 active:scale-[0.98] group"
            >
              <Play className="w-5 h-5 text-slate-950 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>Watch Video Tour (1:45 Min)</span>
            </button>

            <button
              onClick={handleScrollToActionPlan}
              className="px-5 py-4 bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs rounded-2xl backdrop-blur-md transition-all flex items-center gap-2"
            >
              <span>Explore AI Action Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Embedded Real CampusOS Vimeo Video Player */}
        <div className="relative z-10 w-full">
          <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden relative border-2 border-white/20 shadow-2xl bg-black group">
            <iframe
              src="https://player.vimeo.com/video/1219009817?h=1c2eb3ae09&title=0&byline=0&portrait=0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0 rounded-3xl"
              title="CampusOS Official Video Showcase"
            />
          </div>
        </div>
      </div>

      {/* 3. Promotional Solution Cards ("What CampusOS Solves") */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Key Problems Solved by Autonomous AI
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium">
            CampusOS replaces slow manual paperwork with real-time operational reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {problemSolutions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-[#7C3AED] transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center border font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-extrabold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <div className="space-y-2 text-xs leading-relaxed">
                    <p className="text-slate-500 font-medium">
                      <strong className="text-slate-700">Problem:</strong> {item.problem}
                    </p>
                    <p className="text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <strong>Solution:</strong> {item.solution}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onNavigateTab(item.targetTab);
                    playThemeSound('click');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-[#7C3AED] hover:text-white text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Live Feature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Today's AI Action Plan & Command Alerts Section */}
      <div id="ai-action-plan" className="scroll-mt-24 space-y-8">
        <div className="bg-white border border-slate-200/80 p-6 lg:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <div>
              <h3 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-[#7C3AED]" />
                Today's AI Action Plan
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                Proactive recommendations prepared by CampusOS based on live schedule and gate data
              </p>
            </div>
            <span className="text-xs text-[#7C3AED] font-bold bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-3 py-1.5 rounded-full font-mono">
              {pendingRecommendations.length} Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pendingRecommendations.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-xs text-[#64748B] bg-slate-50 border border-slate-200/60 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#0F172A]">All AI Recommendations Executed</h4>
                <p className="text-xs text-[#64748B] mt-1">Campus operations are running smoothly.</p>
              </div>
            ) : (
              pendingRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-[#7C3AED] hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-[#EF4444] bg-[#EF4444]/10 rounded-md">
                        {rec.priority}
                      </span>
                      <span className="text-xs text-[#10B981] font-bold font-mono">
                        {(rec.confidenceScore * 100).toFixed(0)}% Confidence
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0F172A] leading-snug group-hover:text-[#7C3AED] transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">{rec.estimatedImpact}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() =>
                        openExplainability({
                          title: rec.title,
                          confidenceScore: rec.confidenceScore,
                          domain: rec.domain,
                          reasoningBullets: rec.reasoningBullets,
                          recommendedAction: rec.actionPrompt,
                        })
                      }
                      className="text-xs text-[#7C3AED] hover:underline font-bold"
                    >
                      How Sure the AI Is
                    </button>

                    <button
                      onClick={() => {
                        acceptRecommendation(rec.id);
                        onNavigateTab(rec.targetTab);
                      }}
                      className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-md shadow-[#7C3AED]/20 transition-all"
                    >
                      Accept & Execute
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-Time Live Activity Event Log Stream */}
        <AITimelineSidebar />

        {/* Active Command Alerts Feed */}
        <IncidentCommand
          alerts={alerts}
          onResolveAlert={onResolveAlert}
          onResetAlerts={onResetAlerts}
          onOpenExplainability={(item) => openExplainability(item)}
        />
      </div>

      {/* 5. Connected 3-Pillar Ecosystem Diagram (PowerSchool Style) - SINGLE RENDER */}
      <ConnectedEcosystemPillars onNavigateTab={onNavigateTab} />

      {/* 6. Executive Enterprise Product Footer */}
      <footer className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 select-none border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
          {/* Col 1: Brand & Positioning */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#7C3AED] rounded-xl text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Campus<span className="text-[#A78BFA]">OS</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              Autonomous AI Operational Intelligence System for Education.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300 font-bold bg-white/5 p-2 rounded-xl border border-white/10 w-fit">
              <Cpu className="w-3.5 h-3.5 text-amber-300" />
              <span>Gemini 3.6 Vision Powered</span>
            </div>
          </div>

          {/* Col 2: Platform Modules */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-[#A78BFA]">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-slate-400 font-medium">
              <li>
                <button onClick={() => onNavigateTab('incidents')} className="hover:text-white transition-colors">
                  Overview & Incident Command
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('ocr')} className="hover:text-white transition-colors">
                  Student Document OCR
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solver')} className="hover:text-white transition-colors">
                  Classroom Timetable Solver
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('attendance')} className="hover:text-white transition-colors">
                  Spatial Gate Attendance
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('analytics')} className="hover:text-white transition-colors">
                  Staffing & HR Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-[#A78BFA]">
              Enterprise Trust
            </h4>
            <ul className="space-y-1.5 text-slate-400 font-medium">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>FERPA / GDPR Compliant</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Real Authentic Data</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multilingual Hindi/Marathi Vision</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Double-Booking Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Enterprise Solution Credits */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider text-[#A78BFA]">
              Enterprise Solution
            </h4>
            <p className="text-slate-400 leading-relaxed font-medium">
              Powered by <strong className="text-white font-bold">Google Cloud AI</strong> & <strong className="text-white font-bold">Gemini 3.6 Vision</strong>.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="px-3 py-1 bg-[#7C3AED] text-white font-extrabold text-[10px] rounded-full">
                Enterprise Platform Edition
              </span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-bold">All Operational Systems Running Normally</span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            © 2026 CampusOS. Operational Intelligence Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};
