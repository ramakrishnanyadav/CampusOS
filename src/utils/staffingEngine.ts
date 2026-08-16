import { DepartmentStaffing, AttendanceStudent, FacultyMember } from '../types';
import modelWeights from '../../ml/staffing_model_weights.json';

export function calculateStaffingPredictions(
  students: AttendanceStudent[],
  teacherLeaves: Array<{ teacherName: string; department: string; date: string; reason: string }>,
  facultyList?: FacultyMember[]
): DepartmentStaffing[] {
  const isFriday = new Date().getDay() === 5;
  const isMonday = new Date().getDay() === 1;

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const totalCount = students.length || 1;
  const studentAbsenceRate = (totalCount - presentCount) / totalCount;

  let departmentDefs = [
    {
      name: 'Science & Biology',
      iconName: 'Microscope',
      required: 9,
      baseActive: 6,
      subCandidates: ['Dr. Sarah Jenkins', 'Prof. Elena Rostova'],
    },
    {
      name: 'Mathematics',
      iconName: 'Calculator',
      required: 8,
      baseActive: 8,
      subCandidates: ['Mr. David Miller'],
    },
    {
      name: 'Physical Education & Athletics',
      iconName: 'Dumbbell',
      required: 6,
      baseActive: 4,
      subCandidates: ['Coach Mark Torres'],
    },
    {
      name: 'Technology & CS',
      iconName: 'Laptop',
      required: 5,
      baseActive: 4,
      subCandidates: ['Mr. David Miller'],
    },
  ];

  if (facultyList && facultyList.length > 0) {
    const deptsMap = new Map<string, FacultyMember[]>();
    facultyList.forEach((f) => {
      const dName = f.department || 'General Academics';
      const existing = deptsMap.get(dName) || [];
      existing.push(f);
      deptsMap.set(dName, existing);
    });

    departmentDefs = Array.from(deptsMap.entries()).map(([deptName, members]) => {
      const activeMembers = members.filter((m) => m.employmentStatus !== 'ON_LEAVE');
      const subs = members.map((m) => m.name);
      const icon = deptName.toLowerCase().includes('math')
        ? 'Calculator'
        : deptName.toLowerCase().includes('tech') || deptName.toLowerCase().includes('cs')
        ? 'Laptop'
        : deptName.toLowerCase().includes('phys') || deptName.toLowerCase().includes('pe')
        ? 'Dumbbell'
        : 'Microscope';

      return {
        name: deptName,
        iconName: icon,
        required: Math.max(members.length, 5),
        baseActive: activeMembers.length,
        subCandidates: subs.slice(0, 2),
      };
    });
  }

  const safeLeaves = teacherLeaves || [];
  const { intercept, coefficients } = modelWeights;

  return departmentDefs.map((dept) => {
    // Ingest actual teacher leaves matching department keyword
    const deptLeaves = safeLeaves.filter((l) =>
      l.department && l.department.toLowerCase().includes((dept.name.toLowerCase().split(' ')[0]) ?? '')
    );

    const activeCount = Math.max(1, dept.baseActive - deptLeaves.length);
    const leaveCount = deptLeaves.length;
    const fluIndex = isFriday ? 0.65 : isMonday ? 0.45 : 0.25;

    // Evaluate Trained Logistic Regression Model Feature Vector
    const z =
      intercept +
      coefficients.is_friday * (isFriday ? 1 : 0) +
      coefficients.is_monday * (isMonday ? 1 : 0) +
      coefficients.active_leaves * leaveCount +
      coefficients.student_absence_rate * studentAbsenceRate +
      coefficients.seasonal_flu_index * fluIndex;

    const prob = 1 / (1 + Math.exp(-z));
    const shortageProbability = Math.min(98, Math.max(8, Math.round(prob * 100)));

    return {
      department: dept.name,
      iconName: dept.iconName,
      activeTeachers: activeCount,
      requiredTeachers: dept.required,
      shortageProbability,
      peakDays: isFriday ? ['Friday (Active Peak)', 'Monday'] : ['Thursday', 'Friday'],
      suggestedSubs: dept.subCandidates,
    };
  });
}
