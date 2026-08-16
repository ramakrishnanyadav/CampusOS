import { IFacultyRepository } from '../interfaces/IFacultyRepository';
import { FacultyMember, AttendanceStaff } from '../../types';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_FACULTY_KEY = 'campusos_faculty_roster';
const LOCAL_STAFF_ATTENDANCE_KEY = 'campusos_staff_attendance';

export const DEFAULT_FACULTY_ROSTER: FacultyMember[] = [
  { id: 'FAC-101', employeeCode: 'EMP-2001', name: 'Dr. Sarah Connor', department: 'Mathematics', subjectsQualified: ['Mathematics', 'Advanced Calculus'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👩‍🏫', qualification: 'Ph.D. Mathematics', languagesSpoken: ['English', 'Hindi'], assignedClasses: ['10-A', '11-A'] },
  { id: 'FAC-102', employeeCode: 'EMP-2002', name: 'Prof. Alan Smith', department: 'Science & Biology', subjectsQualified: ['Physics Practical', 'Advanced Physics'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👨‍🏫', qualification: 'M.Sc. Physics', languagesSpoken: ['English'], assignedClasses: ['11-B', '12-A'] },
  { id: 'FAC-103', employeeCode: 'EMP-2003', name: 'Prof. Elena Vance', department: 'Science & Biology', subjectsQualified: ['Chemistry Lab', 'Organic Chemistry'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👩‍🔬', qualification: 'M.Sc. Chemistry', languagesSpoken: ['English', 'Marathi'], assignedClasses: ['10-B', '12-B'] },
  { id: 'FAC-104', employeeCode: 'EMP-2004', name: 'Prof. Mark Wood', department: 'Mathematics', subjectsQualified: ['Mathematics', 'Statistics'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👨‍🏫', qualification: 'M.Sc. Statistics', languagesSpoken: ['English', 'Hindi'], assignedClasses: ['9-A', '9-B'] },
  { id: 'FAC-105', employeeCode: 'EMP-2005', name: 'Prof. Kevin Flynn', department: 'Technology & CS', subjectsQualified: ['Computer Science', 'Data Structures'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '💻', qualification: 'B.Tech. Computer Science', languagesSpoken: ['English'], assignedClasses: ['10-A', '10-B', '11-A'] },
  { id: 'FAC-106', employeeCode: 'EMP-2006', name: 'Coach Mark Torres', department: 'Physical Education & Athletics', subjectsQualified: ['Physical Education', 'Athletics'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '🏃', qualification: 'B.P.Ed.', languagesSpoken: ['English', 'Hindi'], assignedClasses: ['8-A', '8-B', '9-A', '9-B'] },
  { id: 'FAC-107', employeeCode: 'EMP-2007', name: 'Dr. Sarah Jenkins', department: 'Science & Biology', subjectsQualified: ['Biology', 'Genetics'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '🔬', qualification: 'Ph.D. Biology', languagesSpoken: ['English'], assignedClasses: ['11-A', '12-A'] },
  { id: 'FAC-108', employeeCode: 'EMP-2008', name: 'Prof. Elena Rostova', department: 'Science & Biology', subjectsQualified: ['Biochemistry', 'Botany'], employmentStatus: 'PART_TIME', maxDailyLimit: 4, avatar: '🌱', qualification: 'M.Sc. Botany', languagesSpoken: ['English', 'Hindi', 'Marathi'], assignedClasses: ['10-A'] },
];

export const DEFAULT_STAFF_ATTENDANCE: AttendanceStaff[] = DEFAULT_FACULTY_ROSTER.map((f) => ({
  id: f.id,
  name: f.name,
  department: f.department,
  status: 'PRESENT',
  checkInTime: '08:15 AM',
  gateZone: 'GATE-NORTH',
}));

export class FirestoreFacultyRepository implements IFacultyRepository {
  constructor(private orgId: string = DEFAULT_ORG_ID) {}

  private get facultyCollectionRef() {
    return collection(db, 'orgs', this.orgId, 'faculty');
  }

  private get staffAttendanceCollectionRef() {
    return collection(db, 'orgs', this.orgId, 'staff_attendance');
  }

  public async getAllFaculty(): Promise<FacultyMember[]> {
    try {
      const snap = await getDocs(this.facultyCollectionRef);
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as FacultyMember);
        localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.warn(`FirestoreFacultyRepository[${this.orgId}]: Firestore unavailable, fallback to local`, err);
    }

    const cached = localStorage.getItem(LOCAL_FACULTY_KEY);
    if (cached) return JSON.parse(cached);

    localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(DEFAULT_FACULTY_ROSTER));
    return DEFAULT_FACULTY_ROSTER;
  }

  public async addFaculty(member: Omit<FacultyMember, 'id'>): Promise<FacultyMember> {
    const newFaculty: FacultyMember = {
      ...member,
      id: `FAC-${Date.now()}`,
    };
    const list = await this.getAllFaculty();
    list.push(newFaculty);
    localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(list));

    try {
      await setDoc(doc(db, 'orgs', this.orgId, 'faculty', newFaculty.id), newFaculty);
    } catch (err) {
      console.error(`FirestoreFacultyRepository[${this.orgId}]: addFaculty failed`, err);
      throw err;
    }

    return newFaculty;
  }

  public async updateFaculty(id: string, updates: Partial<FacultyMember>): Promise<void> {
    const list = await this.getAllFaculty();
    const target = list.find((f) => f.id === id);
    if (target) {
      Object.assign(target, updates);
      localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(list));
      try {
        await updateDoc(doc(db, 'orgs', this.orgId, 'faculty', id), updates);
      } catch (err) {
        console.error(`FirestoreFacultyRepository[${this.orgId}]: updateFaculty failed`, err);
        throw err;
      }
    }
  }

  public async deleteFaculty(id: string): Promise<void> {
    const list = await this.getAllFaculty();
    const filtered = list.filter((f) => f.id !== id);
    localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'orgs', this.orgId, 'faculty', id));
    } catch (err) {
      console.error(`FirestoreFacultyRepository[${this.orgId}]: deleteFaculty failed`, err);
      throw err;
    }
  }

  public subscribeToFaculty(callback: (faculty: FacultyMember[]) => void): () => void {
    try {
      return onSnapshot(
        this.facultyCollectionRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => d.data() as FacultyMember);
            localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(list));
            callback(list);
          }
        },
        (err) => console.warn(`FirestoreFacultyRepository[${this.orgId}] Faculty listener warning:`, err)
      );
    } catch (e) {
      return () => {};
    }
  }

  // Staff Attendance
  public async getStaffAttendance(): Promise<AttendanceStaff[]> {
    try {
      const snap = await getDocs(this.staffAttendanceCollectionRef);
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as AttendanceStaff);
        localStorage.setItem(LOCAL_STAFF_ATTENDANCE_KEY, JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.warn(`FirestoreFacultyRepository[${this.orgId}]: Attendance fallback to local`, err);
    }

    const cached = localStorage.getItem(LOCAL_STAFF_ATTENDANCE_KEY);
    if (cached) return JSON.parse(cached);

    localStorage.setItem(LOCAL_STAFF_ATTENDANCE_KEY, JSON.stringify(DEFAULT_STAFF_ATTENDANCE));
    return DEFAULT_STAFF_ATTENDANCE;
  }

  public async updateStaffStatus(staffId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', checkInTime?: string): Promise<void> {
    const updates: Partial<AttendanceStaff> = { status };
    if (checkInTime) updates.checkInTime = checkInTime;

    const list = await this.getStaffAttendance();
    const target = list.find((s) => s.id === staffId);
    if (target) {
      Object.assign(target, updates);
      localStorage.setItem(LOCAL_STAFF_ATTENDANCE_KEY, JSON.stringify(list));
      try {
        await updateDoc(doc(db, 'orgs', this.orgId, 'staff_attendance', staffId), updates);
      } catch (err) {
        console.error(`FirestoreFacultyRepository[${this.orgId}]: updateStaffStatus failed`, err);
        throw err;
      }
    }
  }

  public subscribeToStaffAttendance(callback: (attendance: AttendanceStaff[]) => void): () => void {
    try {
      return onSnapshot(
        this.staffAttendanceCollectionRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => d.data() as AttendanceStaff);
            localStorage.setItem(LOCAL_STAFF_ATTENDANCE_KEY, JSON.stringify(list));
            callback(list);
          }
        },
        (err) => console.warn(`FirestoreFacultyRepository[${this.orgId}] Attendance listener warning:`, err)
      );
    } catch (e) {
      return () => {};
    }
  }
}
