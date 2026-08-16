import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimelineEvent, CommandAlert, AIExplainabilityItem } from '../../types';

export type WorkflowStage = 'observe' | 'understand' | 'decide' | 'act' | 'review';

export type RecommendationStatus =
  | 'Detected'
  | 'Generated'
  | 'Pending'
  | 'Accepted'
  | 'Executing'
  | 'Completed'
  | 'Audited';

export interface AIRecommendation {
  id: string;
  title: string;
  domain: 'staffing' | 'scheduling' | 'attendance' | 'ocr' | 'incidents';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidenceScore: number;
  estimatedImpact: string;
  timeToResolve: string;
  status: RecommendationStatus;
  reasoningBullets: string[];
  actionPrompt: string;
  targetTab: string;
}

export interface AIRuntimeContextType {
  // Workflow Stage State
  workflowStage: WorkflowStage;
  setWorkflowStage: (stage: WorkflowStage) => void;

  // Recommendations State Machine
  recommendations: AIRecommendation[];
  acceptRecommendation: (id: string) => void;
  pendingRecommendationCount: number;

  // Timeline Stream (Categorized: NOW, NEXT, COMPLETED)
  events: TimelineEvent[];
  emitEvent: (title: string, domain: TimelineEvent['domain'], description: string, category?: 'NOW' | 'NEXT' | 'COMPLETED') => void;

  // Narrative Loader State
  isNarrating: boolean;
  currentNarrationStep: string;
  triggerNarratedAction: (steps: string[], finalAction?: () => void) => void;

  // AI Activity Engine Nervous System
  isAIActive: boolean;
  activeDomainMessage: string;
  triggerAIActivity: (msg: string, durationMs?: number) => void;

  // Explainability Modal State
  explainabilityItem: AIExplainabilityItem | null;
  openExplainability: (item: AIExplainabilityItem) => void;
  closeExplainability: () => void;
}

const INITIAL_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Pre-Allocate Substitute Pool for Friday Science Shortage',
    domain: 'staffing',
    priority: 'CRITICAL',
    confidenceScore: 0.942,
    estimatedImpact: 'High Impact • Prevents 4 Class Disruptions',
    timeToResolve: '< 2 mins',
    status: 'Pending',
    reasoningBullets: [
      '3 Science faculty members submitted leave requests for annual conference',
      'Mid-term lab examination schedule requires 4 certified proctors on Friday',
      'Historical Friday absence probability increase (+14%)',
    ],
    actionPrompt: 'Approve Pre-Allocation of Substitute Prof. Mark Wood',
    targetTab: 'analytics',
  },
  {
    id: 'rec-2',
    title: 'Execute Auto-Solver for AP Physics Room 302 Collision',
    domain: 'scheduling',
    priority: 'CRITICAL',
    confidenceScore: 0.98,
    estimatedImpact: 'Medium Impact • Zero Schedule Overlap',
    timeToResolve: '< 1 min',
    status: 'Pending',
    reasoningBullets: [
      'Dr. Aris Vance double-booked in Science Wing Room 302 & Room 104 during Period 1',
      'Soft constraint limit exceeded: Teacher workload > 5 consecutive periods',
    ],
    actionPrompt: 'Execute Algorithmic Timetable Solver',
    targetTab: 'solver',
  },
  {
    id: 'rec-3',
    title: 'Verify Hindi Admission Form Schema from Vision OCR',
    domain: 'ocr',
    priority: 'HIGH',
    confidenceScore: 0.994,
    estimatedImpact: 'Low Impact • 100% Data Integrity',
    timeToResolve: '< 30 secs',
    status: 'Pending',
    reasoningBullets: [
      'Paper admission form uploaded via administration office scanner',
      'Multi-language Hindi schema parsed with 99.4% confidence score',
    ],
    actionPrompt: 'Post Verified Schema Record to Secure Database',
    targetTab: 'ocr',
  },
];

const INITIAL_EVENTS: TimelineEvent[] = [
  { id: 'evt-1', timestamp: '11:48 AM', title: 'Conflict Resolved', domain: 'scheduling', description: 'Timetable solver reassigned Room 302 to Dr. Sarah Jenkins.' },
  { id: 'evt-2', timestamp: '11:46 AM', title: 'AI Substitute Pre-booked', domain: 'staffing', description: 'Prof. Mark Wood allocated to Science Department Friday pool.' },
  { id: 'evt-3', timestamp: '11:45 AM', title: 'Faculty Absence Flagged', domain: 'incidents', description: '3 Science teachers requested conference leave.' },
  { id: 'evt-4', timestamp: '11:43 AM', title: 'Gate Pass Verified', domain: 'attendance', description: 'Aarav Sharma checked in at Gate 1 Main Arch.' },
  { id: 'evt-5', timestamp: '11:42 AM', title: 'OCR Schema Extracted', domain: 'ocr', description: 'Hindi admission form processed with 99.4% confidence.' },
];

const AIRuntimeContext = createContext<AIRuntimeContextType | undefined>(undefined);

export const AIRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('observe');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [events, setEvents] = useState<TimelineEvent[]>(INITIAL_EVENTS);
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentNarrationStep, setCurrentNarrationStep] = useState('');
  const [isAIActive, setIsAIActive] = useState(false);
  const [activeDomainMessage, setActiveDomainMessage] = useState('AI Operating System Active');
  const [explainabilityItem, setExplainabilityItem] = useState<AIExplainabilityItem | null>(null);

  const pendingRecommendationCount = recommendations.filter((r) => r.status === 'Pending').length;

  const emitEvent = (
    title: string,
    domain: TimelineEvent['domain'],
    description: string,
    category: 'NOW' | 'NEXT' | 'COMPLETED' = 'NOW'
  ) => {
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title,
      domain,
      description,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
  };

  const triggerAIActivity = (msg: string, durationMs = 2500) => {
    setActiveDomainMessage(msg);
    setIsAIActive(true);
    setTimeout(() => {
      setIsAIActive(false);
      setActiveDomainMessage('AI Operating System Active');
    }, durationMs);
  };

  const acceptRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status: 'Completed' };
        }
        return r;
      })
    );

    const rec = recommendations.find((r) => r.id === id);
    if (rec) {
      emitEvent('Recommendation Executed', rec.domain, `Accepted & executed: ${rec.title}`);
      triggerAIActivity(`Executing recommendation: ${rec.title}...`);
    }
  };

  const triggerNarratedAction = (steps: string[], finalAction?: () => void) => {
    setIsNarrating(true);
    setIsAIActive(true);

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCurrentNarrationStep(step);
        setActiveDomainMessage(step);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsNarrating(false);
            setIsAIActive(false);
            setCurrentNarrationStep('');
            setActiveDomainMessage('AI Operating System Active');
            if (finalAction) finalAction();
          }, 600);
        }
      }, idx * 700);
    });
  };

  const openExplainability = (item: AIExplainabilityItem) => setExplainabilityItem(item);
  const closeExplainability = () => setExplainabilityItem(null);

  return (
    <AIRuntimeContext.Provider
      value={{
        workflowStage,
        setWorkflowStage,
        recommendations,
        acceptRecommendation,
        pendingRecommendationCount,
        events,
        emitEvent,
        isNarrating,
        currentNarrationStep,
        triggerNarratedAction,
        isAIActive,
        activeDomainMessage,
        triggerAIActivity,
        explainabilityItem,
        openExplainability,
        closeExplainability,
      }}
    >
      {children}
    </AIRuntimeContext.Provider>
  );
};

export const useAIRuntime = (): AIRuntimeContextType => {
  const context = useContext(AIRuntimeContext);
  if (!context) {
    throw new Error('useAIRuntime must be used within an AIRuntimeProvider');
  }
  return context;
};
