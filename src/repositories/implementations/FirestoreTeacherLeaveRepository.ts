import { ITeacherLeaveRepository, TeacherLeaveRecord } from '../interfaces/ITeacherLeaveRepository';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_KEY = 'campusos_teacher_leaves';

export class FirestoreTeacherLeaveRepository implements ITeacherLeaveRepository {
  constructor(private orgId: string = DEFAULT_ORG_ID) {}

  private get collectionRef() {
    return collection(db, 'orgs', this.orgId, 'teacher_leaves');
  }

  public async getAllLeaves(): Promise<TeacherLeaveRecord[]> {
    try {
      const snap = await getDocs(this.collectionRef);
      if (!snap.empty) {
        const leaves = snap.docs.map((d) => d.data() as TeacherLeaveRecord);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(leaves));
        return leaves;
      }
    } catch (err) {
      console.warn(`FirestoreTeacherLeaveRepository[${this.orgId}]: Offline fallback`, err);
    }
    const cached = localStorage.getItem(LOCAL_KEY);
    return cached ? JSON.parse(cached) : [
      { id: 'leave-1', teacherName: 'Dr. Aris Vance', department: 'Science Wing', date: '2026-08-01', reason: 'Conference Leave' },
      { id: 'leave-2', teacherName: 'Prof. Elena Rostova', department: 'Mathematics', date: '2026-08-01', reason: 'Medical Leave' },
    ];
  }

  public async addLeave(leave: TeacherLeaveRecord): Promise<void> {
    const leaves = await this.getAllLeaves();
    const id = leave.id || `leave-${Date.now()}`;
    const record = { ...leave, id, orgId: this.orgId };
    leaves.unshift(record);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(leaves));
    try {
      await setDoc(doc(db, 'orgs', this.orgId, 'teacher_leaves', id), record, { merge: true });
    } catch (err) {
      console.warn(`FirestoreTeacherLeaveRepository[${this.orgId}]: Offline saved`, err);
    }
  }

  public subscribeToLeaves(callback: (leaves: TeacherLeaveRecord[]) => void): () => void {
    try {
      return onSnapshot(this.collectionRef, (snap) => {
        if (!snap.empty) {
          const leaves = snap.docs.map((d) => d.data() as TeacherLeaveRecord);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(leaves));
          callback(leaves);
        }
      }, (err) => console.warn(`Teacher leaves listener fallback[${this.orgId}]:`, err));
    } catch (e) {
      return () => {};
    }
  }
}
