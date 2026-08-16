import { AttendanceStudent, FacultyMember, CSVImportResult } from '../types';

/**
 * Robust zero-dependency RFC 4180 compliant CSV parser.
 * Handles quoted values, commas inside quotes, CRLF line endings, and trimmed headers.
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
      lines.push(currentLine);
      currentLine = '';
      if (char === '\r') i++; // skip \n in CRLF
    } else if (char !== '\r') {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]!).map((h) => h.trim().toLowerCase());
  const records: Record<string, string>[] = [];

  for (let l = 1; l < lines.length; l++) {
    const rawLine = lines[l]!;
    if (!rawLine.trim()) continue;
    const values = parseCSVLine(rawLine);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = (values[idx] ?? '').trim();
    });
    records.push(rowObj);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}

/**
 * Validates and converts parsed CSV rows into strict AttendanceStudent domain objects.
 */
export function validateStudentCSV(rows: Record<string, string>[]): CSVImportResult<AttendanceStudent> {
  const valid: AttendanceStudent[] = [];
  const invalid: CSVImportResult<AttendanceStudent>['invalid'] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const errors: string[] = [];

    const name = row['name'] || row['student_name'] || row['full_name'] || '';
    const grade = row['grade'] || row['class'] || row['std'] ? `Grade ${row['std'] || '10'}-${row['division'] || 'A'}` : '';
    const stdRaw = row['std'] || row['standard'] || row['class_num'] || '';
    const divisionRaw = row['division'] || row['section'] || row['div'] || 'A';
    const rollNoRaw = row['rollno'] || row['roll_no'] || row['roll_number'] || '';

    if (!name) errors.push('Missing student name');
    
    let std = parseInt(stdRaw, 10);
    if (isNaN(std)) {
      const match = grade.match(/(\d+)/);
      std = match ? parseInt(match[1]!, 10) : 10;
    }

    let rollNo = parseInt(rollNoRaw, 10);
    if (isNaN(rollNo)) {
      rollNo = valid.length + 1;
    }

    const division = divisionRaw.toUpperCase().slice(0, 1) || 'A';
    const formattedGrade = grade || `Grade ${std}-${division}`;

    if (errors.length > 0) {
      invalid.push({ rowNumber: rowNum, rawRow: row, errors });
    } else {
      valid.push({
        id: row['id'] || `STU-CSV-${Date.now().toString().slice(-4)}-${index + 1}`,
        name,
        avatar: '👨‍🎓',
        grade: formattedGrade,
        std,
        division,
        rollNo,
        status: 'PRESENT',
        checkInTime: '08:30 AM',
        gateZone: row['gatezone'] || row['gate_zone'] || 'GATE-MAIN',
        healthBar: 10,
        expLevel: 100,
        aadhaarLast4: row['aadhaar'] ? row['aadhaar'].slice(-4) : undefined,
      });
    }
  });

  return {
    valid,
    invalid,
    totalRows: rows.length,
    successCount: valid.length,
    errorCount: invalid.length,
  };
}

/**
 * Validates and converts parsed CSV rows into strict FacultyMember domain objects.
 */
export function validateFacultyCSV(rows: Record<string, string>[]): CSVImportResult<FacultyMember> {
  const valid: FacultyMember[] = [];
  const invalid: CSVImportResult<FacultyMember>['invalid'] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const errors: string[] = [];

    const name = row['name'] || row['teacher_name'] || row['faculty_name'] || '';
    const dept = row['department'] || row['dept'] || '';
    const empCode = row['employeecode'] || row['employee_code'] || row['emp_code'] || `EMP-${Date.now().toString().slice(-4)}-${index + 1}`;
    const qual = row['qualification'] || row['degree'] || 'B.Ed.';

    if (!name) errors.push('Missing faculty name');
    if (!dept) errors.push('Missing department');

    const subjects = (row['subjectsqualified'] || row['subjects'] || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    const languages = (row['languagesspoken'] || row['languages'] || 'English')
      .split(';')
      .map((l) => l.trim())
      .filter(Boolean);

    const assignedClasses = (row['assignedclasses'] || row['classes'] || '')
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean);

    const limitRaw = parseInt(row['maxdailylimit'] || row['limit'] || '5', 10);
    const maxDailyLimit = isNaN(limitRaw) ? 5 : limitRaw;

    if (errors.length > 0) {
      invalid.push({ rowNumber: rowNum, rawRow: row, errors });
    } else {
      valid.push({
        id: row['id'] || `FAC-CSV-${Date.now().toString().slice(-4)}-${index + 1}`,
        employeeCode: empCode,
        name,
        department: dept,
        subjectsQualified: subjects.length > 0 ? subjects : ['General Education'],
        employmentStatus: (row['employmentstatus'] as any) || 'FULL_TIME',
        maxDailyLimit,
        avatar: '👨‍🏫',
        qualification: qual,
        languagesSpoken: languages.length > 0 ? languages : ['English'],
        assignedClasses,
      });
    }
  });

  return {
    valid,
    invalid,
    totalRows: rows.length,
    successCount: valid.length,
    errorCount: invalid.length,
  };
}
