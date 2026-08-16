import React from 'react';
import { Users, BookOpen, Building, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface ConnectedEcosystemPillarsProps {
  onNavigateTab: (tab: string) => void;
}

export const ConnectedEcosystemPillars: React.FC<ConnectedEcosystemPillarsProps> = ({ onNavigateTab }) => {
  const { playThemeSound } = useTheme();

  return (
    <div className="space-y-8 select-none my-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 px-3 py-1 rounded-full w-fit mx-auto border border-[#7C3AED]/20">
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
          <span>Connected Ecosystem Architecture</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
          One Connected AI System for Every School Need
        </h2>

        <p className="text-sm text-[#64748B] font-medium max-w-xl mx-auto">
          CampusOS connects home attendance, student achievement, and operational analytics into one real-time intelligence network.
        </p>
      </div>

      {/* 3 Connected Pillars Grid (PowerSchool Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Home & Gate Connections (Orange Accent) */}
        <div className="bg-white border-2 border-amber-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-500 text-white font-extrabold text-xs rounded-bl-2xl shadow-sm">
            Home Connections
          </div>

          <div className="space-y-4 pt-2">
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-amber-50 flex items-center justify-center border border-amber-100 relative">
              <img
                src="/images/home_connections.png"
                alt="Home Connections Illustration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Home & Spatial Gate Pass
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                Live RFID gate scanners track student arrivals in 0.12s and notify parents automatically.
              </p>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>Spatial Gate Scanners (Gate 1, 2 & 3)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>Parent Arrival Notification Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>Morning Gate Rush AI Verification</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onNavigateTab('attendance');
              playThemeSound('click');
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
          >
            <span>Open Spatial Attendance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pillar 2: Student Achievement & Timetables (Green Accent) */}
        <div className="bg-white border-2 border-emerald-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white font-extrabold text-xs rounded-bl-2xl shadow-sm">
            Student Achievement
          </div>

          <div className="space-y-4 pt-2">
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-emerald-50 flex items-center justify-center border border-emerald-100 relative">
              <img
                src="/images/student_achievement.png"
                alt="Student Achievement Illustration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Classroom & Timetable Solver
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                Autonomous schedule balancing fixes room double-bookings and teacher overload in seconds.
              </p>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Timetable Room Collisions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AP & Honors Course Balancing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Exam Proctor Allocation Engine</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onNavigateTab('solver');
              playThemeSound('click');
            }}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <span>Open Timetable Solver</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pillar 3: Operational Excellence & OCR (Purple Accent) */}
        <div className="bg-white border-2 border-purple-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#7C3AED] text-white font-extrabold text-xs rounded-bl-2xl shadow-sm">
            Operational Excellence
          </div>

          <div className="space-y-4 pt-2">
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-purple-50 flex items-center justify-center border border-purple-100 relative">
              <img
                src="/images/operational_excellence.png"
                alt="Operational Excellence Illustration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <Building className="w-5 h-5 text-[#7C3AED]" />
                Document OCR & HR Analytics
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                Reads physical paper forms in Hindi/Marathi & pre-allocates substitute teacher pools.
              </p>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                <span>Multilingual Hindi/Marathi OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                <span>Predictive Friday Shortage Pool</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                <span>Automated Database Verification</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onNavigateTab('ocr');
              playThemeSound('click');
            }}
            className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#7C3AED]/20"
          >
            <span>Open Document OCR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
