import { FacultyMember, AttendanceStaff } from '../../types';

export interface IFacultyRepository {
  getAllFaculty(): Promise<FacultyMember[]>;
  addFaculty(member: Omit<FacultyMember, 'id'>): Promise<FacultyMember>;
  updateFaculty(id: string, updates: Partial<FacultyMember>): Promise<void>;
  deleteFaculty(id: string): Promise<void>;
  subscribeToFaculty(callback: (faculty: FacultyMember[]) => void): () => void;

  // Staff Attendance
  getStaffAttendance(): Promise<AttendanceStaff[]>;
  updateStaffStatus(staffId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', checkInTime?: string): Promise<void>;
  subscribeToStaffAttendance(callback: (attendance: AttendanceStaff[]) => void): () => void;
}
