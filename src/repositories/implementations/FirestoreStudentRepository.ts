import { IStudentRepository } from '../interfaces/IStudentRepository';
import { AttendanceStudent } from '../../types';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_KEY = 'campusos_students_roster';

export class FirestoreStudentRepository implements IStudentRepository {
  constructor(private orgId: string = DEFAULT_ORG_ID) {}

  private get collectionRef() {
    return collection(db, 'orgs', this.orgId, 'students');
  }

  public async getAllStudents(): Promise<AttendanceStudent[]> {
    try {
      const snap = await getDocs(this.collectionRef);
      if (!snap.empty) {
        const students = snap.docs.map((d) => d.data() as AttendanceStudent);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(students));
        return students;
      }
    } catch (err) {
      console.warn(`FirestoreStudentRepository[${this.orgId}]: Firestore unavailable, fallback to local cache`, err);
    }

    const cached = localStorage.getItem(LOCAL_KEY);
    return cached ? JSON.parse(cached) : [];
  }

  /**
   * Bulk save students using atomic writeBatch (up to 500 documents per batch).
   */
  public async saveStudents(students: AttendanceStudent[]): Promise<void> {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(students));
    try {
      const batch = writeBatch(db);
      students.forEach((student) => {
        const ref = doc(db, 'orgs', this.orgId, 'students', student.id);
        batch.set(ref, student, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error(`FirestoreStudentRepository[${this.orgId}]: Bulk save failed`, err);
      throw err;
    }
  }

  /**
   * Single-document atomic status update (Fix for Finding #4: Race condition & full roster round-trip).
   */
  public async updateStudentStatus(studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', checkInTime?: string): Promise<void> {
    const healthBar = status === 'PRESENT' ? 10 : 0;
    const updates: Partial<AttendanceStudent> = { status, healthBar };
    if (checkInTime) updates.checkInTime = checkInTime;

    // Update local cache optimistically
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try {
        const list: AttendanceStudent[] = JSON.parse(cached);
        const idx = list.findIndex((s) => s.id === studentId);
        if (idx >= 0 && list[idx]) {
          list[idx] = { ...list[idx]!, ...updates };
          localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
        }
      } catch {}
    }

    try {
      const studentDocRef = doc(db, 'orgs', this.orgId, 'students', studentId);
      await updateDoc(studentDocRef, updates);
    } catch (err) {
      console.error(`FirestoreStudentRepository[${this.orgId}]: Atomic status update failed for ${studentId}`, err);
      throw err;
    }
  }

  public subscribeToStudents(callback: (students: AttendanceStudent[]) => void): () => void {
    try {
      return onSnapshot(
        this.collectionRef,
        (snap) => {
          if (!snap.empty) {
            const students = snap.docs.map((d) => d.data() as AttendanceStudent);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(students));
            callback(students);
          }
        },
        (err) => console.warn(`FirestoreStudentRepository[${this.orgId}] Listener warning:`, err)
      );
    } catch (e) {
      return () => {};
    }
  }
}
