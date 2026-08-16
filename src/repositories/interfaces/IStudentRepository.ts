import { AttendanceStudent } from '../../types';

export interface IStudentRepository {
  getAllStudents(): Promise<AttendanceStudent[]>;
  saveStudents(students: AttendanceStudent[]): Promise<void>;
  updateStudentStatus(studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', checkInTime?: string): Promise<void>;
  subscribeToStudents(callback: (students: AttendanceStudent[]) => void): () => void;
}
