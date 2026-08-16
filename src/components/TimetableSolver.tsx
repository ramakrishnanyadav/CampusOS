import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Eye,
  RefreshCw,
  Building2,
  Printer,
  GitCompare,
} from 'lucide-react';
import { TimetableSlot, AIExplainabilityItem, RoomItem, FacultyMember } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { usePermissions } from '../auth/PermissionContext';
import { TimetableSlotModal } from './TimetableSlotModal';
import { CampusInfrastructureModal } from './CampusInfrastructureModal';
import { solveTimetableConflicts } from '../utils/scheduler';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface TimetableSolverProps {
  slots: TimetableSlot[];
  onUpdateSlots: (updated: TimetableSlot[]) => void;
  onOpenExplainability?: (item: AIExplainabilityItem) => void;
}

export const TimetableSolver: React.FC<TimetableSolverProps> = ({
  slots,
  onUpdateSlots,
  onOpenExplainability,
}) => {
  const { playThemeSound } = useTheme();
  const { hasCapability, setIsElevatedAccessOpen } = usePermissions();

  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfraModalOpen, setIsInfraModalOpen] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [previousSlotsSnapshot, setPreviousSlotsSnapshot] = useState<TimetableSlot[] | null>(null);

  const [slotToEdit, setSlotToEdit] = useState<TimetableSlot | null>(null);
  const [targetCell, setTargetCell] = useState<{ day: string; period: number }>({ day: 'Mon', period: 1 });
  const [isSolving, setIsSolving] = useState(false);

  const [firestoreRooms, setFirestoreRooms] = useState<RoomItem[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);

  useEffect(() => {
    import('../repositories/implementations/FirestoreRoomRepository').then(({ FirestoreRoomRepository }) => {
      const repo = new FirestoreRoomRepository();
      const unsub = repo.subscribeToRooms((rooms) => setFirestoreRooms(rooms));
      return () => unsub();
    });
    import('../repositories/implementations/FirestoreFacultyRepository').then(({ FirestoreFacultyRepository }) => {
      const repo = new FirestoreFacultyRepository();
      const unsub = repo.subscribeToFaculty((faculty) => setFacultyMembers(faculty));
      return () => unsub();
    });
  }, []);

  const canEditInfra = hasCapability('INFRASTRUCTURE_WRITE');
  const canSolveTimetable = hasCapability('TIMETABLE_SOLVE');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = [
    { period: 1, label: 'Period 1', time: '08:30' },
    { period: 2, label: 'Period 2', time: '09:20' },
    { period: 3, label: 'Period 3', time: '10:10' },
    { period: 4, label: 'Period 4', time: '11:15' },
    { period: 5, label: 'Period 5', time: '12:05' },
  ];
  const grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const conflictCount = slots.filter((s) => s.isConflict).length;

  const handleRunCSPSolver = () => {
    if (!canSolveTimetable) {
      setIsElevatedAccessOpen(true);
      return;
    }
    setIsSolving(true);
    playThemeSound('action');

    setPreviousSlotsSnapshot(JSON.parse(JSON.stringify(slots)));

    setTimeout(() => {
      const solved = solveTimetableConflicts(slots);
      onUpdateSlots(solved);
      setIsSolving(false);
      playThemeSound('success');
    }, 600);
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  const handleSaveSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    let next: TimetableSlot[];
    if (slotToEdit) {
      next = slots.map((s) => (s.id === slotToEdit.id ? { ...s, ...slotData } : s));
    } else {
      const newSlot: TimetableSlot = {
        ...slotData,
        id: `slot-${Date.now()}`,
      };
      next = [...slots, newSlot];
    }
    onUpdateSlots(solveTimetableConflicts(next));
  };

  const handleDeleteSlot = (id: string) => {
    const filtered = slots.filter((s) => s.id !== id);
    onUpdateSlots(solveTimetableConflicts(filtered));
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <Card variant="glass" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Smart Timetable Engine</h2>
              {conflictCount > 0 ? (
                <Badge variant="critical">{conflictCount} Conflicts Active</Badge>
              ) : (
                <Badge variant="success">All Slots Conflict-Free</Badge>
              )}
              {canSolveTimetable ? (
                <Badge variant="purple">Read & Write Mode (Admin Edit)</Badge>
              ) : (
                <Badge variant="warning">Read-Only Mode (Student Access)</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Backtracking CSP Solver for teacher qualifications, room capabilities & schedule optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            isLoading={isSolving}
            leftIcon={<Zap className="w-4 h-4 text-amber-300" />}
            onClick={handleRunCSPSolver}
          >
            Run Backtracking CSP Solver
          </Button>

          {previousSlotsSnapshot && (
            <Button
              variant="secondary"
              leftIcon={<GitCompare className="w-4 h-4 text-purple-600" />}
              onClick={() => setShowDiffModal(true)}
            >
              Compare Version Diff
            </Button>
          )}

          <Button
            variant="outline"
            leftIcon={<Building2 className="w-4 h-4 text-purple-600" />}
            onClick={() => {
              playThemeSound('click');
              setIsInfraModalOpen(true);
            }}
          >
            Campus Rooms Directory
          </Button>

          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4 text-[#7C3AED]" />}
            onClick={handlePrintTimetable}
          >
            Export / Print PDF
          </Button>

        </div>
      </Card>

      {/* Grade Selector Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
              selectedGrade === g
                ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20 scale-105'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Timetable Grid View */}
      <Card variant="borderless" className="overflow-x-auto p-4">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200/80">
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-28">Time / Period</th>
              {days.map((d) => (
                <th key={d} className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periods.map((p) => (
              <tr key={p.period} className="hover:bg-slate-50/50">
                <td className="py-4 pr-4 align-top">
                  <div className="text-xs font-extrabold text-slate-900">{p.label}</div>
                  <div className="text-[11px] font-mono text-slate-400">{p.time}</div>
                </td>

                {days.map((d) => {
                  const slot = slots.find(
                    (s) => s.grade === selectedGrade && s.day === d && s.period === p.period
                  );

                  return (
                    <td key={d} className="p-2 align-top text-center">
                      {slot ? (
                        <div
                          className={`p-3 rounded-2xl border transition-all text-left space-y-1 relative group ${
                            slot.isConflict
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 shadow-sm'
                              : 'bg-white border-slate-200/80 hover:border-purple-300 hover:shadow-md'
                          }`}
                        >
                          {slot.isConflict && (
                            <Badge variant="critical" className="mb-1 text-[9px]">
                              Conflict
                            </Badge>
                          )}
                          <div className="text-xs font-extrabold text-slate-900 truncate">{slot.subject}</div>
                          <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate">{slot.teacher}</span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{slot.room}</span>
                          </div>

                          <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white/90 p-1 rounded-xl shadow-md border">
                            <button
                              onClick={() => {
                                if (!canSolveTimetable) {
                                  setIsElevatedAccessOpen(true);
                                  return;
                                }
                                setSlotToEdit(slot);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-purple-600"
                              title={canSolveTimetable ? "Edit Slot" : "Requires Admin Elevation to Edit"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (!canSolveTimetable) {
                                  setIsElevatedAccessOpen(true);
                                  return;
                                }
                                handleDeleteSlot(slot.id);
                              }}
                              className="p-1 text-slate-500 hover:text-rose-600"
                              title={canSolveTimetable ? "Delete Slot" : "Requires Admin Elevation to Delete"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!canSolveTimetable) {
                              setIsElevatedAccessOpen(true);
                              return;
                            }
                            setSlotToEdit(null);
                            setTargetCell({ day: d, period: p.period });
                            setIsModalOpen(true);
                          }}
                          className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-purple-600 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-bold">Add Slot</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Version Diff Modal */}
      {showDiffModal && previousSlotsSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" className="max-w-2xl w-full bg-white space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-purple-600" />
                CSP Solver Version Diff Comparison
              </h3>
              <Button variant="ghost" onClick={() => setShowDiffModal(false)}>
                Close
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {slots.map((postSlot) => {
                const preSlot = previousSlotsSnapshot.find((s) => s.id === postSlot.id);
                const hasChanged = preSlot && (preSlot.teacher !== postSlot.teacher || preSlot.room !== postSlot.room);

                return (
                  <div
                    key={postSlot.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      hasChanged ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-slate-900">{postSlot.subject}</span> ({postSlot.grade} • {postSlot.day} P{postSlot.period})
                    </div>
                    {hasChanged ? (
                      <div className="font-mono text-purple-700 font-bold">
                        {preSlot?.teacher} → <span className="underline">{postSlot.teacher}</span> ({postSlot.room})
                      </div>
                    ) : (
                      <span className="text-slate-400">No Change Required</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Modal Dialogs */}
      {isModalOpen && (
        <TimetableSlotModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSlot}
          slotToEdit={slotToEdit}
          defaultDay={targetCell.day}
          defaultPeriod={targetCell.period}
          selectedGrade={selectedGrade}
        />
      )}

      {isInfraModalOpen && (
        <CampusInfrastructureModal
          isOpen={isInfraModalOpen}
          onClose={() => setIsInfraModalOpen(false)}
        />
      )}
    </div>
  );
};
