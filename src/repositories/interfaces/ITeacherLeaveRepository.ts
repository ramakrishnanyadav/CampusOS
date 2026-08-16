export interface TeacherLeaveRecord {
  id?: string;
  teacherName: string;
  department: string;
  date: string;
  reason: string;
}

export interface ITeacherLeaveRepository {
  getAllLeaves(): Promise<TeacherLeaveRecord[]>;
  addLeave(leave: TeacherLeaveRecord): Promise<void>;
  subscribeToLeaves(callback: (leaves: TeacherLeaveRecord[]) => void): () => void;
}
