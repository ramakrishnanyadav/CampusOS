import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimetableSlot, AttendanceStudent, CommandAlert } from '../types';
import { PersistenceEngine } from '../services/storage/PersistenceEngine';
import { ToastMessage } from '../components/ui/Toast';
import { ExtractedDocumentRecord } from '../repositories/interfaces/IDocumentRepository';
import { TeacherLeaveRecord } from '../repositories/interfaces/ITeacherLeaveRepository';

interface CampusStoreContextType {
  slots: TimetableSlot[];
  students: AttendanceStudent[];
  extractedDocs: ExtractedDocumentRecord[];
  teacherLeaves: TeacherLeaveRecord[];
  alerts: CommandAlert[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  updateSlots: (newSlots: TimetableSlot[]) => void;
  updateStudentStatus: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', checkInTime?: string) => void;
  addExtractedDocument: (docRecord: ExtractedDocumentRecord) => void;
  resolveAlert: (alertId: string) => void;
  isSyncing: boolean;
}

const CampusStoreContext = createContext<CampusStoreContextType | undefined>(undefined);

const DEFAULT_SLOTS: TimetableSlot[] = [
  { id: "slot-1", day: "Mon", period: 1, timeLabel: "08:30", grade: "Grade 10", subject: "AP Physics C", teacher: "Dr. Aris Vance", room: "Science Wing 302", isConflict: true, conflictReason: "Teacher Double-Booked: Dr. Aris Vance in Room 302 & Room 104", signalStrength: 12 },
  { id: "slot-2", day: "Mon", period: 2, timeLabel: "09:20", grade: "Grade 10", subject: "Advanced Calculus", teacher: "Prof. Elena Rostova", room: "Block A 104", isConflict: false, signalStrength: 15 },
  { id: "slot-3", day: "Mon", period: 3, timeLabel: "10:10", grade: "Grade 10", subject: "Physical Education", teacher: "Coach Mark Torres", room: "Main Gymnasium", isConflict: false, signalStrength: 15 },
  { id: "slot-4", day: "Mon", period: 1, timeLabel: "08:30", grade: "Grade 12", subject: "Organic Chemistry", teacher: "Dr. Aris Vance", room: "Science Wing 302", isConflict: true, conflictReason: "Room Collision: Science Wing 302 double booked", signalStrength: 10 },
  { id: "slot-5", day: "Tue", period: 1, timeLabel: "08:30", grade: "Grade 10", subject: "Computer Science Principles", teacher: "Mr. David Miller", room: "CS Lab 2", isConflict: false, signalStrength: 15 },
  { id: "slot-6", day: "Wed", period: 2, timeLabel: "09:20", grade: "Grade 10", subject: "English Literature", teacher: "Mrs. Maya Patel", room: "Block B 201", isConflict: false, signalStrength: 15 },
  { id: "slot-7", day: "Thu", period: 4, timeLabel: "11:15", grade: "Grade 10", subject: "World History", teacher: "Dr. Sarah Jenkins", room: "Auditorium Hall", isConflict: false, signalStrength: 15 },
  { id: "slot-8", day: "Fri", period: 5, timeLabel: "12:05", grade: "Grade 10", subject: "Fine Arts & Design", teacher: "Mrs. Maya Patel", room: "Arts Studio", isConflict: false, signalStrength: 15 },
];

const DEFAULT_STUDENTS: AttendanceStudent[] = [
  { id: 'stu-1', name: 'Aarav Sharma',    avatar: '👨‍🎓', grade: 'Grade 10-A', std: 10, division: 'A', rollNo: 1,  status: 'PRESENT', checkInTime: '08:12 AM', gateZone: 'Gate 1', healthBar: 10, expLevel: 42 },
  { id: 'stu-2', name: 'Maya Lin',        avatar: '👩‍🎓', grade: 'Grade 10-B', std: 10, division: 'B', rollNo: 5,  status: 'PRESENT', checkInTime: '08:15 AM', gateZone: 'Gate 1', healthBar: 10, expLevel: 38 },
  { id: 'stu-3', name: 'Julian Vance',   avatar: '👨‍🏫', grade: 'Grade 9-A',  std: 9,  division: 'A', rollNo: 12, status: 'ABSENT',  gateZone: 'Gate 2',             healthBar: 0,  expLevel: 15 },
  { id: 'stu-4', name: 'Sophia Martinez',avatar: '👩‍💻', grade: 'Grade 8-B',  std: 8,  division: 'B', rollNo: 7,  status: 'ABSENT',  gateZone: 'Gate 2',             healthBar: 0,  expLevel: 22 },
  { id: 'stu-5', name: 'Ethan Wright',   avatar: '👨‍🔬', grade: 'Grade 11-A', std: 11, division: 'A', rollNo: 3,  status: 'PRESENT', checkInTime: '08:05 AM', gateZone: 'Gate 1', healthBar: 10, expLevel: 55 },
  { id: 'stu-6', name: 'Chloe Chen',     avatar: '👩‍🎨', grade: 'Grade 12-A', std: 12, division: 'A', rollNo: 28, status: 'ABSENT',  gateZone: 'Gate 3',             healthBar: 0,  expLevel: 60 },
];


const INITIAL_ALERTS: CommandAlert[] = [
  {
    id: "alert-1",
    title: "Grade 10 AP Physics Double-Booked in Room 302!",
    description: "Dr. Aris Vance scheduled in both Grade 10-A AP Physics and Grade 12 Advanced Biology at Period 1.",
    category: "schedule",
    severity: "critical",
    location: "Science Wing • Room 302",
    xpReward: 35,
    resolved: false,
    actionPrompt: "Execute auto-solver to re-assign substitute Dr. Sarah Jenkins",
  },
  {
    id: "alert-2",
    title: "Unprocessed Physical Medical Waivers Pending!",
    description: "4 physical student medical waiver forms submitted on paper awaiting AI extraction.",
    category: "paperwork",
    severity: "warning",
    location: "Main Office",
    xpReward: 25,
    resolved: false,
    actionPrompt: "Run document OCR engine to post validated record",
  },
  {
    id: "alert-3",
    title: "Staffing Capacity Shortage: Science Department!",
    description: "3 Science faculty members absent. High shortage probability predicted for Friday afternoon.",
    category: "staffing",
    severity: "warning",
    location: "Science Wing",
    xpReward: 30,
    resolved: false,
    actionPrompt: "Pre-allocate substitute candidate pool Prof. Mark Wood",
  },
];

export const CampusStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persistedState] = useState(() => PersistenceEngine.loadState(DEFAULT_SLOTS, DEFAULT_STUDENTS));
  const [slots, setSlots] = useState<TimetableSlot[]>(persistedState.slots);
  const [students, setStudents] = useState<AttendanceStudent[]>(persistedState.students);
  const [extractedDocs, setExtractedDocs] = useState<ExtractedDocumentRecord[]>(persistedState.extractedDocs || []);
  const [teacherLeaves, setTeacherLeaves] = useState<TeacherLeaveRecord[]>(persistedState.teacherLeaves || []);
  const [alerts, setAlerts] = useState<CommandAlert[]>(INITIAL_ALERTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Firestore Real-Time Subscriptions Integration
  useEffect(() => {
    const unsubSlots = PersistenceEngine.timetableRepo.subscribeToSlots((liveSlots) => {
      if (liveSlots && liveSlots.length > 0) setSlots(liveSlots);
    });

    const unsubStudents = PersistenceEngine.studentRepo.subscribeToStudents((liveStudents) => {
      if (liveStudents && liveStudents.length > 0) setStudents(liveStudents);
    });

    const unsubDocs = PersistenceEngine.documentRepo.subscribeToDocuments((liveDocs) => {
      if (liveDocs) setExtractedDocs(liveDocs);
    });

    const unsubLeaves = PersistenceEngine.leaveRepo.subscribeToLeaves((liveLeaves) => {
      if (liveLeaves) setTeacherLeaves(liveLeaves);
    });

    return () => {
      unsubSlots();
      unsubStudents();
      unsubDocs();
      unsubLeaves();
    };
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSlots = (newSlots: TimetableSlot[]) => {
    const previous = [...slots];
    setSlots(newSlots);
    setIsSyncing(true);
    try {
      PersistenceEngine.updateSlots(newSlots);
      addToast({
        type: 'success',
        title: 'Timetable Solved & Saved',
        message: 'Timetable slots updated and synced with cloud store.',
        undoAction: () => {
          setSlots(previous);
          PersistenceEngine.updateSlots(previous);
        },
      });
    } catch (e) {
      setSlots(previous);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not sync slots with database. Rolled back.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const updateStudentStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', checkInTime?: string) => {
    const previous = [...students];
    const targetStudent = students.find((s) => s.id === studentId);

    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          status,
          checkInTime: checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          healthBar: status === 'PRESENT' ? 10 : 0,
        };
      }
      return s;
    });

    setStudents(updated);

    // Proactive Alert Emission for Absences
    if (status === 'ABSENT' && targetStudent) {
      const newAlert: CommandAlert = {
        id: `alert-absence-${Date.now()}`,
        title: `Proactive Absence Warning: ${targetStudent.name} Flagged Unexcused Absent`,
        description: `${targetStudent.name} (${targetStudent.grade}) failed gate check-in. Auto-triggering parent notification protocol.`,
        category: 'attendance',
        severity: 'warning',
        location: targetStudent.gateZone || 'Main Gate',
        xpReward: 20,
        resolved: false,
        actionPrompt: 'Trigger automated parent notification call',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }

    try {
      PersistenceEngine.updateStudents(updated);
      addToast({
        type: 'info',
        title: 'Attendance Updated',
        message: `Student check-in status changed to ${status}.`,
        undoAction: () => {
          setStudents(previous);
          PersistenceEngine.updateStudents(previous);
        },
      });
    } catch (e) {
      setStudents(previous);
    }
  };

  const addExtractedDocument = (docRecord: ExtractedDocumentRecord) => {
    setExtractedDocs((prev) => [docRecord, ...prev]);
    PersistenceEngine.addExtractedDoc(docRecord);

    // Proactive Alert Emission for Ingested OCR Document
    const avgConfidence = docRecord.fields?.length
      ? Math.round((docRecord.fields.reduce((acc, f) => acc + (f.confidence || 0.95), 0) / docRecord.fields.length) * 100)
      : 99;

    const newAlert: CommandAlert = {
      id: `alert-ocr-${Date.now()}`,
      title: `Vision OCR Ingested: ${docRecord.title || 'Student Record'}`,
      description: `Physical document read with ${avgConfidence}% confidence. Structured JSON auto-written to vault.`,
      category: 'paperwork',
      severity: 'info',
      location: 'Vision OCR Vault',
      xpReward: 15,
      resolved: false,
      actionPrompt: 'Review extracted PII record schema',
    };
    setAlerts((prev) => [newAlert, ...prev]);

    addToast({
      type: 'success',
      title: 'Document Saved',
      message: `${docRecord.title} verified and recorded.`,
    });
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a))
    );
    addToast({
      type: 'success',
      title: 'Alert Resolved',
      message: 'Operational issue marked resolved.',
    });
  };

  return (
    <CampusStoreContext.Provider
      value={{
        slots,
        students,
        extractedDocs,
        teacherLeaves,
        alerts,
        toasts,
        addToast,
        removeToast,
        updateSlots,
        updateStudentStatus,
        addExtractedDocument,
        resolveAlert,
        isSyncing,
      }}
    >
      {children}
    </CampusStoreContext.Provider>
  );
};

export const useCampusStore = () => {
  const ctx = useContext(CampusStoreContext);
  if (!ctx) throw new Error('useCampusStore must be used within CampusStoreProvider');
  return ctx;
};
