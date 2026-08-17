import { calculateStaffingPredictions } from '../utils/staffingEngine';
import { AttendanceStudent } from '../types';

export function describe(name: string, fn: () => void) {
  console.log(`Running ${name}...`);
  fn();
}

export function it(name: string, fn: () => void) {
  fn();
}

export function runStaffingTests() {
  console.log('Running Data-Driven Staffing Engine Unit Tests...');

  describe('Data-Driven Staffing Engine Tests', () => {
    it('calculates department shortage predictions correctly', () => {
      const mockStudents: AttendanceStudent[] = [
        { id: 'stu-1', name: 'Student 1', avatar: '👨‍🎓', grade: '10-A', std: 10, division: 'A', rollNo: 1, status: 'PRESENT', gateZone: 'G1', healthBar: 10, expLevel: 10 },
        { id: 'stu-2', name: 'Student 2', avatar: '👩‍🎓', grade: '10-A', std: 10, division: 'A', rollNo: 2, status: 'ABSENT',  gateZone: 'G1', healthBar: 0,  expLevel: 10 },
      ];

      const mockLeaves = [
        { teacherName: 'Dr. Aris Vance', department: 'Science & Biology', date: '2026-08-01', reason: 'Conference' },
      ];

      const predictions = calculateStaffingPredictions(mockStudents, mockLeaves);

      if (predictions.length === 0) {
        throw new Error('Staffing Test Failed: No department predictions returned!');
      }

      const scienceDept = predictions.find((d) => d.department.includes('Science'));
      if (!scienceDept) {
        throw new Error('Staffing Test Failed: Science department missing in predictions!');
      }

      if (scienceDept.shortageProbability < 10) {
        throw new Error('Staffing Test Failed: Shortage probability underestimated for absent faculty!');
      }
    });
  });

  console.log('✅ Data-Driven Staffing Engine Unit Tests Passed (0 errors)');
  return true;
}
