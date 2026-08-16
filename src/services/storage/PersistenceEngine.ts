import { TimetableSlot, AttendanceStudent } from '../../types';
import { FirestoreTimetableRepository } from '../../repositories/implementations/FirestoreTimetableRepository';
import { FirestoreStudentRepository } from '../../repositories/implementations/FirestoreStudentRepository';
import { FirestoreDocumentRepository } from '../../repositories/implementations/FirestoreDocumentRepository';
import { FirestoreTeacherLeaveRepository } from '../../repositories/implementations/FirestoreTeacherLeaveRepository';
import { ExtractedDocumentRecord } from '../../repositories/interfaces/IDocumentRepository';
import { TeacherLeaveRecord } from '../../repositories/interfaces/ITeacherLeaveRepository';

const STORAGE_KEY = 'campusos_v1_store';

export interface PersistedState {
  version: string;
  slots: TimetableSlot[];
  students: AttendanceStudent[];
  extractedDocs: ExtractedDocumentRecord[];
  teacherLeaves: TeacherLeaveRecord[];
}

export type SyncErrorListener = (err: Error, entity: string) => void;

export class PersistenceEngine {
  public static timetableRepo = new FirestoreTimetableRepository();
  public static studentRepo = new FirestoreStudentRepository();
  public static documentRepo = new FirestoreDocumentRepository();
  public static leaveRepo = new FirestoreTeacherLeaveRepository();

  private static errorListeners: SyncErrorListener[] = [];

  public static onSyncError(listener: SyncErrorListener): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  private static handleSyncError(entity: string, err: any): void {
    console.warn(`[PersistenceEngine] Firestore cloud sync warning (${entity}):`, err.message || err);
    this.errorListeners.forEach((l) => l(err instanceof Error ? err : new Error(String(err)), entity));
  }

  public static loadState(defaultSlots: TimetableSlot[], defaultStudents: AttendanceStudent[]): PersistedState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        if (parsed.version === 'campusos_v1' && parsed.slots.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('PersistenceEngine: LocalStorage fallback', e);
    }

    const defaultState: PersistedState = {
      version: 'campusos_v1',
      slots: defaultSlots,
      students: defaultStudents,
      extractedDocs: [],
      teacherLeaves: [
        { id: 'leave-1', teacherName: 'Dr. Aris Vance', department: 'Science Wing', date: '2026-08-01', reason: 'Conference Leave' },
        { id: 'leave-2', teacherName: 'Prof. Elena Rostova', department: 'Mathematics', date: '2026-08-01', reason: 'Medical Leave' },
      ],
    };

    PersistenceEngine.saveState(defaultState);
    // Async cloud sync with telemetry error handlers
    PersistenceEngine.timetableRepo.saveSlots(defaultSlots).catch((err) => this.handleSyncError('slots', err));
    PersistenceEngine.studentRepo.saveStudents(defaultStudents).catch((err) => this.handleSyncError('students', err));
    return defaultState;
  }

  public static saveState(state: PersistedState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('PersistenceEngine: Failed to save local state', e);
    }
  }

  public static async updateSlotsAsync(slots: TimetableSlot[]): Promise<void> {
    const state = PersistenceEngine.getOrInitState();
    state.slots = slots;
    PersistenceEngine.saveState(state);
    try {
      await PersistenceEngine.timetableRepo.saveSlots(slots);
    } catch (err) {
      this.handleSyncError('slots', err);
      throw err;
    }
  }

  public static updateSlots(slots: TimetableSlot[]): void {
    const state = PersistenceEngine.getOrInitState();
    state.slots = slots;
    PersistenceEngine.saveState(state);
    PersistenceEngine.timetableRepo.saveSlots(slots).catch((err) => this.handleSyncError('slots', err));
  }

  public static updateStudents(students: AttendanceStudent[]): void {
    const state = PersistenceEngine.getOrInitState();
    state.students = students;
    PersistenceEngine.saveState(state);
    PersistenceEngine.studentRepo.saveStudents(students).catch((err) => this.handleSyncError('students', err));
  }

  public static addExtractedDoc(docRecord: ExtractedDocumentRecord): void {
    const state = PersistenceEngine.getOrInitState();
    state.extractedDocs.unshift(docRecord);
    PersistenceEngine.saveState(state);
    PersistenceEngine.documentRepo.addDocument(docRecord).catch((err) => this.handleSyncError('extractedDocs', err));
  }

  public static addTeacherLeave(leave: TeacherLeaveRecord): void {
    const state = PersistenceEngine.getOrInitState();
    state.teacherLeaves.unshift(leave);
    PersistenceEngine.saveState(state);
    PersistenceEngine.leaveRepo.addLeave(leave).catch((err) => this.handleSyncError('teacherLeaves', err));
  }

  private static getOrInitState(): PersistedState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      version: 'campusos_v1',
      slots: [],
      students: [],
      extractedDocs: [],
      teacherLeaves: [],
    };
  }
}
