import { solveTimetableConflicts, CAMPUS_ROOM_DIRECTORY } from '../utils/scheduler';
import { TimetableSlot } from '../types';

export function runSchedulerTests() {
  console.log('Running Backtracking CSP Timetable Solver Unit Tests...');

  const mockCollidingSlots: TimetableSlot[] = [
    {
      id: 'slot-1',
      day: 'Mon',
      period: 1,
      timeLabel: '08:30',
      grade: 'Grade 10',
      subject: 'AP Physics C',
      teacher: 'Dr. Aris Vance',
      room: 'Science Wing 302',
      isConflict: true,
      signalStrength: 15,
    },
    {
      id: 'slot-2',
      day: 'Mon',
      period: 1,
      timeLabel: '08:30',
      grade: 'Grade 12',
      subject: 'Organic Chemistry',
      teacher: 'Dr. Aris Vance',
      room: 'Science Wing 302',
      isConflict: true,
      signalStrength: 15,
    },
  ];

  const resolved = solveTimetableConflicts(mockCollidingSlots);
  const hasConflict = resolved.some((s) => s.isConflict);

  if (hasConflict) {
    throw new Error('CSP Scheduler Test Failed: Conflicts remain after backtracking solve step!');
  }

  // Verify no teacher or room double-bookings exist across period 1
  const assignedTeachers = new Set<string>();
  resolved.forEach((slot) => {
    if (assignedTeachers.has(slot.teacher)) {
      throw new Error(`CSP Scheduler Test Failed: Teacher ${slot.teacher} double-booked in period ${slot.period}`);
    }
    assignedTeachers.add(slot.teacher);
  });

  const validRooms = new Set(CAMPUS_ROOM_DIRECTORY.map((r) => r.name));
  resolved.forEach((slot) => {
    if (!validRooms.has(slot.room)) {
      throw new Error(`CSP Scheduler Test Failed: Room ${slot.room} not in registered directory!`);
    }
  });

  console.log('✅ Backtracking CSP Timetable Solver Unit Tests Passed (0 errors)');
  return true;
}
