import React from 'react';
import { QrCode, CheckCircle2, Clock, MapPin, User, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface StudentPortalViewProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ onNavigateTab }) => {
  const studentInfo = {
    name: 'Aarav Sharma',
    id: 'STU-1042',
    grade: 'Grade 10-A',
    gateStatus: 'Gate 1 RFID Verified (08:30 AM)',
    attendancePct: 96,
  };

  const todaysSchedule = [
    { period: 'Period 1 (08:30 - 09:20)', subject: 'AP Physics', room: 'Science Lab 2 (Room 304)', teacher: 'Dr. Sarah Jenkins' },
    { period: 'Period 2 (09:20 - 10:10)', subject: 'Advanced Algebra', room: 'Lecture Hall 1 (Room 101)', teacher: 'Prof. Elena Rostova' },
    { period: 'Period 3 (10:10 - 11:00)', subject: 'Computer Science', room: 'CS Lab 1 (Room 201)', teacher: 'Mr. David Miller' },
    { period: 'Period 4 (11:15 - 12:05)', subject: 'Physical Education', room: 'Gymnasium & Field', teacher: 'Coach Mark Torres' },
  ];

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      {/* 1. Hero Statement: One Sentence, One Action */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Student & Parent Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Good Morning, {studentInfo.name}.</h1>
          <p className="text-sm text-purple-100 font-medium">
            Your RFID pass is verified at {studentInfo.gateStatus}. Next class: <strong className="text-white">AP Physics</strong> at 08:30 AM in Room 304.
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => onNavigateTab('solver')}
          className="bg-white text-purple-900 font-extrabold hover:bg-slate-100 shrink-0"
        >
          View Class Timetable
        </Button>
      </div>

      {/* 2. Grid: Digital ID Card & Attendance Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Digital Student ID & RFID Gate Pass */}
        <Card variant="glass" className="md:col-span-5 space-y-5 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-600" />
              Digital Student Identity & RFID Pass
            </h3>
            <Badge variant="success">ACTIVE</Badge>

          </div>

          <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-3 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto border-2 border-white/20 shadow-lg">
              AS
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white">{studentInfo.name}</h4>
              <p className="text-xs text-purple-300 font-mono mt-0.5">{studentInfo.id} • {studentInfo.grade}</p>
            </div>

            <div className="pt-2 flex justify-center">
              <div className="p-3 bg-white text-slate-900 rounded-xl flex items-center gap-2 text-xs font-mono font-bold shadow-inner">
                <QrCode className="w-8 h-8 text-slate-900" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 uppercase">Spatial Gate Pass</div>
                  <div>PASS-2026-VERIFIED</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Checked in today at {studentInfo.gateStatus}</span>
          </div>
        </Card>

        {/* Today's Schedule & Attendance Metric */}
        <Card variant="glass" className="md:col-span-7 space-y-5 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Today's Class Schedule
              </h3>
              <p className="text-xs text-slate-500">Live Period Telemetry</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-mono">
                {studentInfo.attendancePct}% Present
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {todaysSchedule.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-purple-300 transition-all">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <span>{item.subject}</span>
                    {idx === 0 && <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">NEXT CLASS</span>}
                  </div>
                  <div className="text-slate-500 font-medium flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {item.period}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {item.room}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {item.teacher}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
