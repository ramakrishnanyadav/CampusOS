import React from 'react';
import { Eye, Brain, CheckSquare, Zap, History } from 'lucide-react';
import { useAIRuntime, WorkflowStage } from '../ai/runtime/AIRuntimeContext';
import { useTheme } from '../theme/ThemeContext';

interface WorkflowNavigatorProps {
  onNavigateTab: (tab: string) => void;
}

export const WorkflowNavigator: React.FC<WorkflowNavigatorProps> = ({ onNavigateTab }) => {
  const { workflowStage, setWorkflowStage } = useAIRuntime();
  const { playThemeSound } = useTheme();

  const stages: { id: WorkflowStage; label: string; icon: any; targetTab: string; description: string }[] = [
    {
      id: 'observe',
      label: 'Observe',
      icon: Eye,
      targetTab: 'attendance',
      description: 'Attendance & Gate Sensors',
    },
    {
      id: 'understand',
      label: 'Understand',
      icon: Brain,
      targetTab: 'ocr',
      description: 'Document Vision OCR',
    },
    {
      id: 'decide',
      label: 'Decide',
      icon: CheckSquare,
      targetTab: 'analytics',
      description: 'AI Recommendations',
    },
    {
      id: 'act',
      label: 'Act',
      icon: Zap,
      targetTab: 'solver',
      description: 'Timetable Resolution',
    },
    {
      id: 'review',
      label: 'Review',
      icon: History,
      targetTab: 'incidents',
      description: 'Incident Audit Feed',
    },
  ];

  const handleStageSelect = (stage: (typeof stages)[0]) => {
    setWorkflowStage(stage.id);
    onNavigateTab(stage.targetTab);
    playThemeSound('click');
  };

  return (
    <div className="bg-[#111827] border border-white/[0.08] p-1.5 rounded-xl shadow-lg flex items-center justify-between gap-1 overflow-x-auto">
      {stages.map((stage) => {
        const Icon = stage.icon;
        const isActive = workflowStage === stage.id;

        return (
          <button
            key={stage.id}
            onClick={() => handleStageSelect(stage)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[#38BDF8] text-slate-950 shadow-md shadow-[#38BDF8]/20 font-bold'
                : 'text-[#94A3B8] hover:bg-[#1F2937] hover:text-[#F8FAFC]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-[#38BDF8]'}`} />
            <span>{stage.label}</span>
          </button>
        );
      })}
    </div>
  );
};
