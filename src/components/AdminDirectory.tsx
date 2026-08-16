import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Shield,
  Download,
  BookOpen,
  Bus,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { AttendanceStudent, FacultyMember, InfrastructureSummary, CSVImportResult } from '../types';
import { parseCSV, validateStudentCSV, validateFacultyCSV } from '../utils/csvImport';
import { CAMPUS_ROOM_DIRECTORY } from '../utils/scheduler';
import { usePermissions } from '../auth/PermissionContext';
import { useTheme } from '../theme/ThemeContext';

export const AdminDirectory: React.FC = () => {
  const { playThemeSound } = useTheme();
  const { hasCapability } = usePermissions();

  const [activeTab, setActiveTab] = useState<'students' | 'faculty' | 'infrastructure' | 'csv_import'>('students');

  // Directory state
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [infra, setInfra] = useState<InfrastructureSummary | null>(null);

  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStd, setSelectedStd] = useState<string>('ALL');
  const [selectedDiv, setSelectedDiv] = useState<string>('ALL');

  const [facultySearch, setFacultySearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // CSV Import State
  const [importType, setImportType] = useState<'student' | 'faculty'>('student');
  const [csvText, setCsvText] = useState('');
  const [studentResult, setStudentResult] = useState<CSVImportResult<AttendanceStudent> | null>(null);
  const [facultyResult, setFacultyResult] = useState<CSVImportResult<FacultyMember> | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    import('../context/CampusStoreContext').then(() => {
      // Load default seed / localStorage data
      const storedStudents = localStorage.getItem('campusos_students');
      if (storedStudents) {
        try { setStudents(JSON.parse(storedStudents)); } catch {}
      } else {
        setStudents([
          { id: 'stu-1', name: 'Aarav Sharma', avatar: '👨‍🎓', grade: 'Grade 10-A', std: 10, division: 'A', rollNo: 1, status: 'PRESENT', checkInTime: '08:12 AM', gateZone: 'Gate 1', healthBar: 10, expLevel: 42, aadhaarLast4: '9812' },
          { id: 'stu-2', name: 'Maya Lin', avatar: '👩‍🎓', grade: 'Grade 10-B', std: 10, division: 'B', rollNo: 5, status: 'PRESENT', checkInTime: '08:15 AM', gateZone: 'Gate 1', healthBar: 10, expLevel: 38, aadhaarLast4: '4410' },
          { id: 'stu-3', name: 'Julian Vance', avatar: '👨‍🏫', grade: 'Grade 9-A', std: 9, division: 'A', rollNo: 12, status: 'ABSENT', gateZone: 'Gate 2', healthBar: 0, expLevel: 15 },
          { id: 'stu-4', name: 'Sophia Martinez', avatar: '👩‍💻', grade: 'Grade 8-B', std: 8, division: 'B', rollNo: 7, status: 'ABSENT', gateZone: 'Gate 2', healthBar: 0, expLevel: 22 },
          { id: 'stu-5', name: 'Ethan Wright', avatar: '👨‍🔬', grade: 'Grade 11-A', std: 11, division: 'A', rollNo: 3, status: 'PRESENT', checkInTime: '08:05 AM', gateZone: 'Gate 1', healthBar: 10, expLevel: 55 },
          { id: 'stu-6', name: 'Chloe Chen', avatar: '👩‍🎨', grade: 'Grade 12-A', std: 12, division: 'A', rollNo: 28, status: 'ABSENT', gateZone: 'Gate 3', healthBar: 0, expLevel: 60 },
        ]);
      }

      const storedFaculty = localStorage.getItem('campusos_faculty_roster');
      if (storedFaculty) {
        try { setFaculty(JSON.parse(storedFaculty)); } catch {}
      } else {
        setFaculty([
          { id: 'FAC-101', employeeCode: 'EMP-2001', name: 'Dr. Sarah Connor', department: 'Mathematics', subjectsQualified: ['Mathematics', 'Advanced Calculus'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👩‍🏫', qualification: 'Ph.D. Mathematics', languagesSpoken: ['English', 'Hindi'], assignedClasses: ['10-A', '11-A'] },
          { id: 'FAC-102', employeeCode: 'EMP-2002', name: 'Prof. Alan Smith', department: 'Science & Biology', subjectsQualified: ['Physics Practical', 'Advanced Physics'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👨‍🏫', qualification: 'M.Sc. Physics', languagesSpoken: ['English'], assignedClasses: ['11-B', '12-A'] },
          { id: 'FAC-103', employeeCode: 'EMP-2003', name: 'Prof. Elena Vance', department: 'Science & Biology', subjectsQualified: ['Chemistry Lab', 'Organic Chemistry'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👩‍🔬', qualification: 'M.Sc. Chemistry', languagesSpoken: ['English', 'Marathi'], assignedClasses: ['10-B', '12-B'] },
          { id: 'FAC-104', employeeCode: 'EMP-2004', name: 'Prof. Mark Wood', department: 'Mathematics', subjectsQualified: ['Mathematics', 'Statistics'], employmentStatus: 'FULL_TIME', maxDailyLimit: 5, avatar: '👨‍🏫', qualification: 'M.Sc. Statistics', languagesSpoken: ['English', 'Hindi'], assignedClasses: ['9-A', '9-B'] },
        ]);
      }

      // Aggregate infrastructure
      const classrooms = CAMPUS_ROOM_DIRECTORY.filter((r) => r.type === 'General Classroom').map((r) => ({
        id: r.id, name: r.name, type: 'CLASSROOM' as const, capacity: r.capacity, building: r.building, isAccessible: true,
      }));
      const labs = CAMPUS_ROOM_DIRECTORY.filter((r) => r.type.includes('Lab')).map((r) => ({
        id: r.id, name: r.name, type: 'LAB' as const, capacity: r.capacity, building: r.building, isAccessible: true,
      }));
      const auditoriums = CAMPUS_ROOM_DIRECTORY.filter((r) => r.type.includes('Auditorium')).map((r) => ({
        id: r.id, name: r.name, type: 'AUDITORIUM' as const, capacity: r.capacity, building: r.building, isAccessible: true,
      }));

      setInfra({
        classrooms,
        labs,
        libraries: [{ id: 'LIB-01', name: 'Central Academic Library', type: 'LIBRARY', capacity: 150, building: 'Central Block', isAccessible: true }],
        auditoriums,
        gymAndSports: [{ id: 'GYM-01', name: 'Multi-Sport Gymnasium', type: 'GYMNASIUM', capacity: 200, building: 'Sports Complex', isAccessible: true }],
        buses: [
          { id: 'BUS-01', busNumber: 'BUS-01', route: 'Route A — North Campus express', capacity: 52, driverName: 'Rajesh Sharma', driverContact: '+91 98765 43210', isOperational: true },
          { id: 'BUS-02', busNumber: 'BUS-02', route: 'Route B — Metro link feeder', capacity: 48, driverName: 'Suresh Patil', driverContact: '+91 98765 43211', isOperational: true },
        ],

        totalCapacity: CAMPUS_ROOM_DIRECTORY.reduce((s, r) => s + r.capacity, 0),
        totalRooms: CAMPUS_ROOM_DIRECTORY.length,
        specialized: [],
        lastUpdated: new Date().toISOString().split('T')[0]!,
      });

    });
  }, []);

  // Filtered lists
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.id.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStd = selectedStd === 'ALL' || String(s.std) === selectedStd;
    const matchesDiv = selectedDiv === 'ALL' || s.division.toUpperCase() === selectedDiv.toUpperCase();
    return matchesSearch && matchesStd && matchesDiv;
  });

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(facultySearch.toLowerCase()) || f.employeeCode.toLowerCase().includes(facultySearch.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || f.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Handle CSV file upload
  const handleCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setCsvText(content);
      processCSVContent(content, importType);
    };
    reader.readAsText(file);
  };

  const processCSVContent = (rawText: string, type: 'student' | 'faculty') => {
    const parsedRows = parseCSV(rawText);
    if (type === 'student') {
      const res = validateStudentCSV(parsedRows);
      setStudentResult(res);
      setFacultyResult(null);
    } else {
      const res = validateFacultyCSV(parsedRows);
      setFacultyResult(res);
      setStudentResult(null);
    }
  };

  const commitCSVImport = () => {
    playThemeSound('success');
    if (importType === 'student' && studentResult) {
      const updated = [...students, ...studentResult.valid];
      setStudents(updated);
      localStorage.setItem('campusos_students', JSON.stringify(updated));
      setImportSuccessMsg(`Successfully imported ${studentResult.valid.length} student records into database.`);
    } else if (importType === 'faculty' && facultyResult) {
      const updated = [...faculty, ...facultyResult.valid];
      setFaculty(updated);
      localStorage.setItem('campusos_faculty_roster', JSON.stringify(updated));
      setImportSuccessMsg(`Successfully imported ${facultyResult.valid.length} faculty members into roster.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <Shield className="w-5 h-5 text-purple-400" />
            </span>
            <h2 className="text-xl font-black tracking-tight">CampusOS Master Admin Directory</h2>
          </div>
          <p className="text-xs text-slate-300">
            Multi-tenant directory registry, class division filters & batch CSV ingestion engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['students', 'faculty', 'infrastructure', 'csv_import'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { playThemeSound('click'); setActiveTab(tab); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === tab
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {tab === 'students' && '👨‍🎓 Students'}
              {tab === 'faculty' && '👩‍🏫 Faculty'}
              {tab === 'infrastructure' && '🏢 Infrastructure'}
              {tab === 'csv_import' && '📥 Batch Import'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: STUDENT DIRECTORY ────────────────────────────────────────── */}
      {activeTab === 'students' && (
        <Card variant="glass" className="p-6 bg-white space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Std filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStd}
                  onChange={(e) => setSelectedStd(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Std</option>
                  {[8, 9, 10, 11, 12].map((s) => (
                    <option key={s} value={String(s)}>Std {s}</option>
                  ))}
                </select>

                <select
                  value={selectedDiv}
                  onChange={(e) => setSelectedDiv(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Div</option>
                  {['A', 'B', 'C', 'D'].map((d) => (
                    <option key={d} value={d}>Div {d}</option>
                  ))}
                </select>
              </div>
            </div>

            <Badge variant="purple">{filteredStudents.length} Students Enrolled</Badge>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Std / Division</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Aadhaar (Last 4)</th>
                  <th className="py-3 px-4">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{s.id}</td>
                    <td className="py-3 px-4 flex items-center gap-2 font-bold text-slate-900">
                      <span>{s.avatar}</span>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg font-bold">
                        Std {s.std} — Div {s.division}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">#{s.rollNo}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {s.aadhaarLast4 ? `•••• ${s.aadhaarLast4}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={s.status === 'PRESENT' ? 'success' : 'critical'}>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── TAB 2: FACULTY ROSTER ───────────────────────────────────────────── */}
      {activeTab === 'faculty' && (
        <Card variant="glass" className="p-6 bg-white space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search code or name..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">All Departments</option>
                {['Mathematics', 'Science & Biology', 'Technology & CS', 'Physical Education & Athletics'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <Badge variant="purple">{filteredFaculty.length} Active Faculty</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaculty.map((f) => (
              <div key={f.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white rounded-xl border border-slate-200 shadow-sm">{f.avatar}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{f.name}</h4>
                      <p className="text-xs text-purple-700 font-mono font-bold">{f.employeeCode} • {f.department}</p>
                    </div>
                  </div>
                  <Badge variant="info">{f.employmentStatus}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Qualification</span>{f.qualification}</div>
                  <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Max Daily Limit</span>{f.maxDailyLimit} Periods</div>
                  <div className="col-span-2"><span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Classes</span>{(f.assignedClasses || []).join(', ') || 'Floating TA'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}


      {/* ─── TAB 3: INFRASTRUCTURE SUMMARY ──────────────────────────────────── */}
      {activeTab === 'infrastructure' && infra && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="glass" className="p-4 bg-white space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Classrooms</span>
              <p className="text-2xl font-black text-slate-900">{infra.classrooms.length}</p>
              <p className="text-[11px] text-slate-500 font-medium">General learning halls</p>
            </Card>
            <Card variant="glass" className="p-4 bg-white space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Specialized Labs</span>
              <p className="text-2xl font-black text-purple-700">{infra.labs.length}</p>
              <p className="text-[11px] text-slate-500 font-medium">Physics, Chem, CS & Robotics</p>
            </Card>
            <Card variant="glass" className="p-4 bg-white space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Campus Capacity</span>
              <p className="text-2xl font-black text-emerald-600">{infra.totalCapacity} Seats</p>
              <p className="text-[11px] text-slate-500 font-medium">Synchronous room capacity</p>
            </Card>
            <Card variant="glass" className="p-4 bg-white space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">School Buses</span>
              <p className="text-2xl font-black text-blue-600">{infra.buses.length} Fleet Vehicles</p>
              <p className="text-[11px] text-slate-500 font-medium">Active transit routes</p>
            </Card>
          </div>

          <Card variant="glass" className="p-6 bg-white space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Bus className="w-4 h-4 text-purple-600" />
              School Bus Fleet Operations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infra.buses.map((b) => (
                <div key={b.busNumber} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-purple-700 text-sm">{b.busNumber}</span>
                    <Badge variant="success">OPERATIONAL</Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{b.route}</p>
                  <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                    <span>Driver: {b.driverName}</span>
                    <span>Contact: {b.driverContact}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 4: CSV BATCH IMPORT ─────────────────────────────────────────── */}
      {activeTab === 'csv_import' && (
        <Card variant="glass" className="p-6 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Batch CSV Ingestion Engine</h3>
              <p className="text-xs text-slate-500">RFC 4180 compliant parser with schema validation & preview.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setImportType('student')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  importType === 'student' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Student CSV
              </button>
              <button
                onClick={() => setImportType('faculty')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  importType === 'faculty' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Faculty CSV
              </button>
            </div>
          </div>

          {importSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload .CSV File
                <input type="file" accept=".csv" onChange={handleCSVFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-slate-400">or paste raw CSV contents below</span>
            </div>

            <textarea
              rows={5}
              placeholder={
                importType === 'student'
                  ? 'name,std,division,rollNo,aadhaar\nAarav Patel,10,A,1,9812\nPriya Sharma,10,B,2,4410'
                  : 'name,department,qualification,employeeCode\nDr. Aris Vance,Mathematics,Ph.D. Math,EMP-104'
              }
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                processCSVContent(e.target.value, importType);
              }}
              className="w-full p-4 bg-slate-900 text-purple-300 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Validation Results */}
          {studentResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold">
                <span>Total Rows: {studentResult.totalRows}</span>
                <span className="text-emerald-600">Valid: {studentResult.successCount}</span>
                <span className="text-rose-600">Invalid: {studentResult.errorCount}</span>
                <Button onClick={commitCSVImport} disabled={studentResult.successCount === 0}>
                  Import {studentResult.successCount} Students
                </Button>
              </div>
            </div>
          )}

          {facultyResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold">
                <span>Total Rows: {facultyResult.totalRows}</span>
                <span className="text-emerald-600">Valid: {facultyResult.successCount}</span>
                <span className="text-rose-600">Invalid: {facultyResult.errorCount}</span>
                <Button onClick={commitCSVImport} disabled={facultyResult.successCount === 0}>
                  Import {facultyResult.successCount} Faculty Members
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
