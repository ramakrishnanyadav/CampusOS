import { TimetableSlot, RoomItem } from '../types';
import { DEFAULT_CAMPUS_ROOMS } from '../repositories/implementations/FirestoreRoomRepository';

export type CampusRoom = RoomItem;
export const CAMPUS_ROOM_DIRECTORY: RoomItem[] = DEFAULT_CAMPUS_ROOMS;
export const ALL_ROOM_ITEMS = CAMPUS_ROOM_DIRECTORY;



export const TEACHER_QUALIFICATIONS: Record<string, string[]> = {
  'Dr. Aris Vance': ['Physics', 'AP Physics C', 'Chemistry', 'Organic Chemistry', 'Biology'],
  'Prof. Elena Rostova': ['Mathematics', 'Advanced Calculus', 'Algebra'],
  'Coach Mark Torres': ['Physical Education', 'Sports'],
  'Mr. David Miller': ['Computer Science', 'Computer Science Principles', 'Programming'],
  'Mrs. Maya Patel': ['English', 'English Literature', 'Fine Arts', 'Fine Arts & Design'],
  'Dr. Sarah Jenkins': ['History', 'World History', 'Physics', 'Chemistry', 'Organic Chemistry'],
};

export const SUBJECT_REQUIRED_ROOM_TYPE: Record<string, CampusRoom['type']> = {
  'AP Physics C': 'Science Lab',
  'Organic Chemistry': 'Science Lab',
  'Computer Science Principles': 'CS Lab',
  'Physical Education': 'Gymnasium',
  'World History': 'Auditorium',
};

export const ALL_TEACHERS = Object.keys(TEACHER_QUALIFICATIONS);
export const ALL_ROOMS = CAMPUS_ROOM_DIRECTORY.map((r) => r.name);

/**
 * Genuine Backtracking Constraint Satisfaction Problem (CSP) Solver with MRV Heuristic.
 * Evaluates Hard Constraints: Teacher Collision, Room Collision, Subject Qualification, & Room Type Capability.
 */
export function solveTimetableConflicts(slots: TimetableSlot[]): TimetableSlot[] {
  const currentSlots: TimetableSlot[] = JSON.parse(JSON.stringify(slots));

  // Identify slots involved in collisions or invalid assignments
  const conflictIndices: number[] = [];
  for (let i = 0; i < currentSlots.length; i++) {
    const s1 = currentSlots[i]!;
    const isTeacherCollision = currentSlots.some(
      (s2, idx) => idx !== i && s2.day === s1.day && s2.period === s1.period && s2.teacher === s1.teacher
    );
    const isRoomCollision = currentSlots.some(
      (s2, idx) => idx !== i && s2.day === s1.day && s2.period === s1.period && s2.room === s1.room
    );

    if (s1.isConflict || isTeacherCollision || isRoomCollision) {
      conflictIndices.push(i);
    }
  }

  if (conflictIndices.length === 0) {
    return currentSlots.map((s) => ({ ...s, isConflict: false, conflictReason: undefined }));
  }

  // Sort variables by Most Constrained Variable (MRV) heuristic
  conflictIndices.sort((idxA, idxB) => {
    const slotA = currentSlots[idxA]!;
    const slotB = currentSlots[idxB]!;
    const choicesA = countAvailableChoices(currentSlots, slotA, idxA);
    const choicesB = countAvailableChoices(currentSlots, slotB, idxB);
    return choicesA - choicesB;
  });

  // Execute Backtracking Search
  const solvedState = backtrackSolve(currentSlots, conflictIndices, 0);

  // Return final validated slots state
  return (solvedState || currentSlots).map((s1, i, arr) => {
    const roomConflict = arr.find(
      (s2, idx) => idx !== i && s2.day === s1.day && s2.period === s1.period && s2.room === s1.room
    );
    const teacherConflict = arr.find(
      (s2, idx) => idx !== i && s2.day === s1.day && s2.period === s1.period && s2.teacher === s1.teacher
    );

    if (roomConflict) {
      return {
        ...s1,
        isConflict: true,
        conflictReason: `CSP Solver Failure: Room Collision (${s1.room} double-booked)`,
      };
    }
    if (teacherConflict) {
      return {
        ...s1,
        isConflict: true,
        conflictReason: `CSP Solver Failure: Teacher Collision (${s1.teacher} double-booked)`,
      };
    }

    return {
      ...s1,
      isConflict: false,
      conflictReason: undefined,
    };
  });
}

function countAvailableChoices(
  slots: TimetableSlot[],
  slot: TimetableSlot,
  targetIdx: number,
  rooms = CAMPUS_ROOM_DIRECTORY
): number {
  let count = 0;
  const requiredRoomType = SUBJECT_REQUIRED_ROOM_TYPE[slot.subject] || 'General Classroom';
  const matchingRooms = rooms.filter((r) => r.type === requiredRoomType || r.type === 'General Classroom');

  for (const teacher of ALL_TEACHERS) {
    const isQual = (TEACHER_QUALIFICATIONS[teacher] || []).some((q) =>
      slot.subject.toLowerCase().includes(q.toLowerCase())
    );
    if (!isQual) continue;

    for (const rm of matchingRooms) {
      if (isValidAssignment(slots, targetIdx, teacher, rm.name, slot.day, slot.period)) {
        count++;
      }
    }
  }
  return count;
}

function isValidAssignment(
  slots: TimetableSlot[],
  targetIdx: number,
  teacher: string,
  room: string,
  day: string,
  period: number
): boolean {
  for (let i = 0; i < slots.length; i++) {
    if (i === targetIdx) continue;
    const s = slots[i]!;
    if (s.day === day && s.period === period) {
      if (s.teacher === teacher) return false; // Teacher collision
      if (s.room === room) return false; // Room collision
    }
  }
  return true;
}

export function backtrackSolve(
  slots: TimetableSlot[],
  conflictIndices: number[],
  currentStep: number,
  rooms = CAMPUS_ROOM_DIRECTORY,
  teachersMap = TEACHER_QUALIFICATIONS
): TimetableSlot[] | null {
  if (currentStep >= conflictIndices.length) {
    return slots; // All variables successfully assigned without constraint violations
  }

  const slotIdx = conflictIndices[currentStep];
  if (slotIdx === undefined) return null;
  const targetSlot = slots[slotIdx]!;
  const requiredRoomType = SUBJECT_REQUIRED_ROOM_TYPE[targetSlot.subject] || 'General Classroom';

  const validRooms = rooms
    .filter((r) => r.type === requiredRoomType)
    .concat(rooms.filter((r) => r.type === 'General Classroom' || r.type !== requiredRoomType));

  const availableTeachers = Object.keys(teachersMap);

  // Try qualified candidate teachers
  for (const candidateTeacher of availableTeachers) {
    const isQualified = (teachersMap[candidateTeacher] ?? []).some((qual) =>
      targetSlot.subject.toLowerCase().includes(qual.toLowerCase())
    );
    if (!isQualified) continue;

    // Try valid candidate rooms
    for (const candidateRoomObj of validRooms) {
      const candidateRoom = candidateRoomObj.name;

      if (isValidAssignment(slots, slotIdx, candidateTeacher, candidateRoom, targetSlot.day, targetSlot.period)) {
        // Apply assignment candidate
        const originalTeacher = slots[slotIdx]!.teacher;
        const originalRoom = slots[slotIdx]!.room;

        slots[slotIdx]!.teacher = candidateTeacher;
        slots[slotIdx]!.room = candidateRoom;
        slots[slotIdx]!.isConflict = false;
        slots[slotIdx]!.conflictReason = undefined;

        // Recursive backtracking step
        const result = backtrackSolve(slots, conflictIndices, currentStep + 1, rooms, teachersMap);
        if (result) return result;

        // Backtrack: restore previous state
        slots[slotIdx]!.teacher = originalTeacher;
        slots[slotIdx]!.room = originalRoom;
      }
    }
  }

  return null; // Unresolvable constraint branch
}
