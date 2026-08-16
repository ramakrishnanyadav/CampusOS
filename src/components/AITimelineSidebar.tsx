import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { TimelineEvent } from '../types';
import { useAIRuntime } from '../ai/runtime/AIRuntimeContext';

export const AITimelineSidebar: React.FC = () => {
  const { events } = useAIRuntime();

  const getDomainColor = (domain: TimelineEvent['domain']) => {
    switch (domain) {
      case 'ai':
        return 'bg-[#7C3AED] text-[#7C3AED]';
      case 'ocr':
        return 'bg-[#6366F1] text-[#6366F1]';
      case 'scheduling':
        return 'bg-[#F59E0B] text-[#F59E0B]';
      case 'attendance':
        return 'bg-[#10B981] text-[#10B981]';
      case 'staffing':
        return 'bg-[#0284C7] text-[#0284C7]';
      case 'incidents':
        return 'bg-[#EF4444] text-[#EF4444]';
      default:
        return 'bg-[#7C3AED] text-[#7C3AED]';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 p-6 lg:p-8 rounded-3xl shadow-sm space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#7C3AED]" />
            Live Campus Activity
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Real-time feed of system checks, gate passes, and administrative actions
          </p>
        </div>
        <span className="text-xs text-[#10B981] font-bold bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
          Live Stream
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.slice(0, 6).map((event) => {
          const colorClass = getDomainColor(event.domain);
          return (
            <div
              key={event.id}
              className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-2 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F172A] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]}`} />
                  {event.title}
                </span>
                <span className="text-[11px] text-[#64748B] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.timestamp}
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed font-medium">{event.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
