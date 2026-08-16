
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  BookOpen,
  DoorOpen,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { RoomItem, FacultyMember, AttendanceStudent } from '../types';
import { FirestoreRoomRepository } from '../repositories/implementations/FirestoreRoomRepository';
import { FirestoreFacultyRepository } from '../repositories/implementations/FirestoreFacultyRepository';
import { FirestoreStudentRepository } from '../repositories/implementations/FirestoreStudentRepository';
import { useCampusStore } from '../context/CampusStoreContext';
import { usePermissions } from '../auth/PermissionContext';

const roomRepo = new FirestoreRoomRepository();
const facultyRepo = new FirestoreFacultyRepository();
const studentRepo = new FirestoreStudentRepository();

export const CampusSetupPortal: React.FC = () => {
  const { addToast } = useCampusStore();
  const { hasCapability, setIsElevatedAccessOpen } = usePermissions();

  const [activeTab, setActiveTab] = useState<'infrastructure' | 'faculty' | 'students'>('infrastructure');
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);

  // Room Form Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('General Classroom');
  const [roomCapacity, setRoomCapacity] = useState(40);
  const [roomBuilding, setRoomBuilding] = useState('Academic Block A');

  // Faculty Form Modal State
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [facultyName, setFacultyName] = useState('');
  const [facultyDept, setFacultyDept] = useState('Mathematics');
  const [facultySubjects, setFacultySubjects] = useState('Mathematics, Algebra');
  const [facultyStatus, setFacultyStatus] = useState<'FULL_TIME' | 'PART_TIME' | 'ADJUNCT' | 'ON_LEAVE'>('FULL_TIME');
  const [facultyLimit, setFacultyLimit] = useState(5);

  // Student Form Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Class 10-A');
  const [studentGate, setStudentGate] = useState('GATE-MAIN');

  useEffect(() => {
    // Initial fetch + real-time listeners
    roomRepo.getAllRooms().then(setRooms);
    facultyRepo.getAllFaculty().then(setFaculty);
    studentRepo.getAllStudents().then(setStudents);

    const unsubRooms = roomRepo.subscribeToRooms(setRooms);
    const unsubFaculty = facultyRepo.subscribeToFaculty(setFaculty);
    const unsubStudents = studentRepo.subscribeToStudents(setStudents);

    return () => {
      unsubRooms();
      unsubFaculty();
      unsubStudents();
    };
  }, []);

  // Capability check helper
  const checkAdminAccess = (): boolean => {
    if (!hasCapability('CONFIG_WRITE')) {
      setIsElevatedAccessOpen(true);
      return false;
    }
    return true;
  };

  // ROOM ACTIONS
  const handleSaveRoom = async () => {
    if (!checkAdminAccess()) return;
    if (!roomName.trim()) return;

    if (editingRoomId) {
      await roomRepo.updateRoom(editingRoomId, {
        name: roomName,
        type: roomType,
        capacity: roomCapacity,
        building: roomBuilding,
      });
      addToast({ type: 'success', title: 'Room Updated', message: `Saved changes to ${roomName}` });
    } else {
      await roomRepo.addRoom({
        name: roomName,
        type: roomType,
        capacity: roomCapacity,
        building: roomBuilding,
        isAvailable: true,
      });
      addToast({ type: 'success', title: 'Room Created', message: `Added ${roomName} to infrastructure directory.` });
    }

    resetRoomForm();
  };

  const handleToggleRoomStatus = async (room: RoomItem) => {
    if (!checkAdminAccess()) return;
    await roomRepo.updateRoom(room.id, { isAvailable: !room.isAvailable });
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `${room.name} is now ${!room.isAvailable ? 'Available' : 'Maintenance'}`,
    });
  };

  // Confirmation Modal State for Destructive Actions
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string; type: 'room' | 'faculty' | 'student' } | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { id, name, type } = deleteConfirmTarget;

    if (type === 'room') {
      await roomRepo.deleteRoom(id);
      addToast({ type: 'warning', title: 'Room Removed', message: `Deleted ${name} from system.` });
    } else if (type === 'faculty') {
      await facultyRepo.deleteFaculty(id);
      addToast({ type: 'warning', title: 'Faculty Removed', message: `Deleted ${name} from roster.` });
    } else if (type === 'student') {
      const currentList = await studentRepo.getAllStudents();
      const filtered = currentList.filter((s) => s.id !== id);
      await studentRepo.saveStudents(filtered);
      addToast({ type: 'warning', title: 'Student Deleted', message: `Removed ${name} from roster.` });
    }

    setDeleteConfirmTarget(null);
  };

  const handleDeleteRoom = (id: string, name: string) => {
    if (!checkAdminAccess()) return;
    setDeleteConfirmTarget({ id, name, type: 'room' });
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (!checkAdminAccess()) return;
    setDeleteConfirmTarget({ id, name, type: 'faculty' });
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (!checkAdminAccess()) return;
    setDeleteConfirmTarget({ id, name, type: 'student' });
  };

  const resetRoomForm = () => {
    setEditingRoomId(null);
    setRoomName('');
    setRoomType('General Classroom');
    setRoomCapacity(40);
    setRoomBuilding('Academic Block A');
    setShowRoomModal(false);
  };

  // FACULTY ACTIONS
  const handleSaveFaculty = async () => {
    if (!checkAdminAccess()) return;
    if (!facultyName.trim()) return;

    const subjectsArray = facultySubjects.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingFacultyId) {
      await facultyRepo.updateFaculty(editingFacultyId, {
        name: facultyName,
        department: facultyDept,
        subjectsQualified: subjectsArray,
        employmentStatus: facultyStatus,
        maxDailyLimit: facultyLimit,
      });
      addToast({ type: 'success', title: 'Faculty Updated', message: `Updated profile for ${facultyName}` });
    } else {
      await facultyRepo.addFaculty({
        name: facultyName,
        department: facultyDept,
        subjectsQualified: subjectsArray,
        employmentStatus: facultyStatus,
        maxDailyLimit: facultyLimit,
        avatar: '👨‍🏫',
        employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
        qualification: '',
        languagesSpoken: ['English'],
        assignedClasses: [],
      });
      addToast({ type: 'success', title: 'Faculty Added', message: `Enrolled ${facultyName} to ${facultyDept}` });
    }

    resetFacultyForm();
  };

  const resetFacultyForm = () => {
    setEditingFacultyId(null);
    setFacultyName('');
    setFacultyDept('Mathematics');
    setFacultySubjects('Mathematics, Algebra');
    setFacultyStatus('FULL_TIME');
    setFacultyLimit(5);
    setShowFacultyModal(false);
  };

  // STUDENT ACTIONS
  const handleSaveStudent = async () => {
    if (!checkAdminAccess()) return;
    if (!studentName.trim()) return;

    const currentList = await studentRepo.getAllStudents();

    if (editingStudentId) {
      const idx = currentList.findIndex((s) => s.id === editingStudentId);
      if (idx >= 0) {
        currentList[idx]!.name = studentName;
        currentList[idx]!.grade = studentGrade;
        currentList[idx]!.gateZone = studentGate;
      }
    } else {
      const gradeStr = studentGrade; // e.g. "Class 10-A"
      const stdMatch = gradeStr.match(/(\d+)/);
      const divMatch = gradeStr.match(/-(\w+)$/);
      currentList.push({
        id: `STU-${Date.now().toString().slice(-4)}`,
        name: studentName,
        avatar: '👨‍🎓',
        grade: studentGrade,
        std: stdMatch ? parseInt(stdMatch[1]!, 10) : 10,
        division: divMatch ? divMatch[1]! : 'A',
        rollNo: currentList.length + 1,
        status: 'PRESENT',
        checkInTime: '08:30 AM',
        gateZone: studentGate,
        healthBar: 10,
        expLevel: 100,
      });

    }

    await studentRepo.saveStudents(currentList);
    addToast({ type: 'success', title: 'Student Saved', message: `Updated student record for ${studentName}` });
    resetStudentForm();
  };

  const resetStudentForm = () => {
    setEditingStudentId(null);
    setStudentName('');
    setStudentGrade('Class 10-A');
    setStudentGate('GATE-MAIN');
    setShowStudentModal(false);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <Card variant="glass" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A]">Campus Master Setup & Data Portal</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enterprise Firestore Directory for Infrastructure Rooms, Faculty Roster & Student Enrolment
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'infrastructure' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5 inline mr-1.5" /> Rooms & Infrastructure ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'faculty' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1.5" /> Faculty & Staff ({faculty.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'students' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 inline mr-1.5" /> Student Roster ({students.length})
          </button>
        </div>
      </Card>

      {/* SEARCH BAR & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-purple-600"
          />
        </div>

        {activeTab === 'infrastructure' && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              resetRoomForm();
              setShowRoomModal(true);
            }}
          >
            Add New Room
          </Button>
        )}

        {activeTab === 'faculty' && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              resetFacultyForm();
              setShowFacultyModal(true);
            }}
          >
            Add Faculty Member
          </Button>
        )}

        {activeTab === 'students' && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              resetStudentForm();
              setShowStudentModal(true);
            }}
          >
            Enroll New Student
          </Button>
        )}
      </div>

      {/* TAB 1: INFRASTRUCTURE ROOMS */}
      {activeTab === 'infrastructure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms
            .filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.building.toLowerCase().includes(searchTerm.toLowerCase()) || r.type.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((room) => (
              <Card key={room.id} variant="borderless" className="space-y-3 relative hover:border-purple-300 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant={room.isAvailable ? 'success' : 'purple'}>
                      {room.type}
                    </Badge>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{room.name}</h3>
                    <p className="text-xs text-slate-500">{room.building}</p>
                  </div>

                  <button
                    onClick={() => handleToggleRoomStatus(room)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl transition-all"
                    title="Toggle Status"
                  >
                    {room.isAvailable ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-mono border-t border-slate-100 pt-2 text-slate-600">
                  <span>Capacity: <strong className="text-slate-900">{room.capacity} seats</strong></span>
                  <span>Status: <strong className={room.isAvailable ? 'text-emerald-600' : 'text-rose-500'}>{room.isAvailable ? 'Available' : 'Maintenance'}</strong></span>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingRoomId(room.id);
                      setRoomName(room.name);
                      setRoomType(room.type);
                      setRoomCapacity(room.capacity);
                      setRoomBuilding(room.building);
                      setShowRoomModal(true);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-purple-600 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* TAB 2: FACULTY ROSTER */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculty
            .filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.department.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((f) => (
              <Card key={f.id} variant="borderless" className="space-y-3 hover:border-purple-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                    {f.avatar || '👨‍🏫'}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{f.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{f.department}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {f.subjectsQualified.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500 font-mono">
                  <span>Status: <strong className="text-purple-700">{f.employmentStatus}</strong></span>
                  <span>Limit: <strong className="text-slate-900">{f.maxDailyLimit} p/d</strong></span>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingFacultyId(f.id);
                      setFacultyName(f.name);
                      setFacultyDept(f.department);
                      setFacultySubjects(f.subjectsQualified.join(', '));
                      setFacultyStatus(f.employmentStatus);
                      setFacultyLimit(f.maxDailyLimit);
                      setShowFacultyModal(true);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-purple-600 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFaculty(f.id, f.name)}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* TAB 3: STUDENT ROSTER */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students
            .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.grade.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((s) => (
              <Card key={s.id} variant="borderless" className="space-y-3 hover:border-purple-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      {s.avatar || '👨‍🎓'}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{s.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{s.grade} • {s.id}</p>
                    </div>
                  </div>
                  <Badge variant={s.status === 'PRESENT' ? 'success' : 'purple'}>{s.status}</Badge>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500 font-mono">
                  <span>Zone: <strong className="text-slate-900">{s.gateZone}</strong></span>
                  <span>Check-in: <strong className="text-slate-900">{s.checkInTime || '--'}</strong></span>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingStudentId(s.id);
                      setStudentName(s.name);
                      setStudentGrade(s.grade);
                      setStudentGate(s.gateZone);
                      setShowStudentModal(true);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-purple-600 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(s.id, s.name)}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" className="max-w-md w-full space-y-4 bg-white">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingRoomId ? 'Edit Room' : 'Add Infrastructure Room'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Central Library 201"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Room Type (Open / Custom)</label>
                <input
                  type="text"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  placeholder="e.g. Library, Science Lab, Lecture Hall"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Capacity</label>
                  <input
                    type="number"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Building</label>
                  <input
                    type="text"
                    value={roomBuilding}
                    onChange={(e) => setRoomBuilding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={resetRoomForm}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveRoom}>Save Room</Button>
            </div>
          </Card>
        </div>
      )}

      {/* FACULTY MODAL */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" className="max-w-md w-full space-y-4 bg-white">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingFacultyId ? 'Edit Faculty Member' : 'Add Faculty Member'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Faculty Name</label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                <input
                  type="text"
                  value={facultyDept}
                  onChange={(e) => setFacultyDept(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Qualified Subjects (Comma separated)</label>
                <input
                  type="text"
                  value={facultySubjects}
                  onChange={(e) => setFacultySubjects(e.target.value)}
                  placeholder="e.g. Mathematics, AP Calculus, Physics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={resetFacultyForm}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveFaculty}>Save Faculty</Button>
            </div>
          </Card>
        </div>
      )}

      {/* STUDENT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" className="max-w-md w-full space-y-4 bg-white">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingStudentId ? 'Edit Student Record' : 'Enroll New Student'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Ananya Deshpande"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Class / Grade</label>
                  <input
                    type="text"
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Gate Zone</label>
                  <input
                    type="text"
                    value={studentGate}
                    onChange={(e) => setStudentGate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={resetStudentForm}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveStudent}>Save Student</Button>
            </div>
          </Card>
        </div>
      )}

      {/* DESTRUCTIVE ACTION CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" className="max-w-md w-full space-y-4 bg-white border-2 border-rose-200 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Record Deletion</h3>
                <p className="text-xs text-slate-500">Destructive Firestore Write Confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium bg-rose-50/80 p-3 rounded-xl border border-rose-200/60">
              Are you sure you want to delete <strong className="text-rose-950">{deleteConfirmTarget.name}</strong> from the campus database? This action will immediately remove the record from Firestore sync.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmTarget(null)}>Cancel</Button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Yes, Delete Record
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
