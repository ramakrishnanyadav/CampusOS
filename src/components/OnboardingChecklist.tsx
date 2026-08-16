import React, { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, X, ChevronRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface OnboardingChecklistProps {
  onNavigateTab: (tab: string) => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ onNavigateTab }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>(['step-1']);

  const steps = [
    {
      id: 'step-1',
      title: 'Initialize School Infrastructure',
      desc: 'Verify registered classrooms, science labs, and computer labs in Academic Block.',
      targetTab: 'incidents',
    },
    {
      id: 'step-2',
      title: 'Run First Multilingual Form Extraction',
      desc: 'Upload a physical paper fee receipt or admission form in Hindi / Marathi / English.',
      targetTab: 'ocr',
    },
    {
      id: 'step-3',
      title: 'Solve Timetable Conflicts with CSP Solver',
      desc: 'Execute backtracking search solver to optimize period schedules and teacher allocations.',
      targetTab: 'solver',

    },
    {
      id: 'step-4',
      title: 'Verify Gate Attendance Simulation',
      desc: 'Check live spatial RFID gate check-ins at Gate 1 Main Entrance.',
      targetTab: 'attendance',
    },
  ];

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);

  if (isDismissed) return null;

  return (
    <Card variant="glass" className="mb-6 space-y-4 border border-purple-500/20 shadow-xl shadow-purple-500/5 backdrop-blur-2xl">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-600 text-white rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">New Administrator Onboarding Checklist</h3>
            <p className="text-xs text-slate-500 font-medium">
              Complete these steps to set up CampusOS for your school
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-purple-700">{progressPercent}% Complete</div>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {steps.map((s) => {
          const isDone = completedSteps.includes(s.id);
          return (
            <div
              key={s.id}
              onClick={() => {
                toggleStep(s.id);
                onNavigateTab(s.targetTab);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-300/60 text-slate-800'
                  : 'bg-white border-slate-200/80 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`text-xs font-extrabold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
