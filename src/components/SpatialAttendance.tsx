import React, { useState, useEffect } from "react";
import { AttendanceStudent, AttendanceStaff } from "../types";
import { useTheme } from "../theme/ThemeContext";
import { usePermissions } from "../auth/PermissionContext";
import { FirestoreFacultyRepository } from "../repositories/implementations/FirestoreFacultyRepository";
import { Users, Check, Footprints, Radio, UserCheck, GraduationCap } from "lucide-react";

const facultyRepo = new FirestoreFacultyRepository();

interface SpatialAttendanceProps {
  students: AttendanceStudent[];
  onCheckInStudent: (studentId: string, status?: 'PRESENT' | 'ABSENT') => void;
  onSimulateBatchCheckIn: () => void;
  onOpenExplainability: (item: any) => void;
}

export const SpatialAttendance: React.FC<SpatialAttendanceProps> = ({
  students,
  onCheckInStudent,
  onSimulateBatchCheckIn,
  onOpenExplainability,
}) => {
  const { playThemeSound } = useTheme();
  const { hasCapability, setIsElevatedAccessOpen } = usePermissions();
  const [activeZone, setActiveZone] = useState("Gate 1 • Main Entrance");
  const [isStreaming, setIsStreaming] = useState(false);
  const [gateTarget, setGateTarget] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [staffList, setStaffList] = useState<AttendanceStaff[]>([]);

  useEffect(() => {
    facultyRepo.getStaffAttendance().then(setStaffList);
    const unsub = facultyRepo.subscribeToStaffAttendance(setStaffList);
    return () => unsub();
  }, []);

  const handleStaffCheckIn = async (staffId: string) => {
    if (!hasCapability("ATTENDANCE_WRITE")) {
      setIsElevatedAccessOpen(true);
      return;
    }
    const current = staffList.find((s) => s.id === staffId);
    const nextStatus = current?.status === "PRESENT" ? "ABSENT" : "PRESENT";
    playThemeSound(nextStatus === "PRESENT" ? "click" : "action");
    await facultyRepo.updateStaffStatus(
      staffId,
      nextStatus,
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleGateCheckIn = (studentId: string) => {
    if (!hasCapability("ATTENDANCE_WRITE")) {
      setIsElevatedAccessOpen(true);
      return;
    }
    const current = students.find((s) => s.id === studentId);
    const nextStatus = current?.status === "PRESENT" ? "ABSENT" : "PRESENT";
    playThemeSound(nextStatus === "PRESENT" ? "click" : "action");
    onCheckInStudent(studentId, nextStatus);
  };

  const handleBatchCheckIn = () => {
    if (!hasCapability("ATTENDANCE_WRITE")) {
      setIsElevatedAccessOpen(true);
      return;
    }
    playThemeSound("success");
    onSimulateBatchCheckIn();
  };

  const handleStartRfidStream = () => {
    if (!hasCapability("ATTENDANCE_WRITE")) {
      setIsElevatedAccessOpen(true);
      return;
    }
    setIsStreaming(!isStreaming);
    playThemeSound("action");

    if (!isStreaming) {
      const absentStudents = students.filter((s) => s.status === "ABSENT");
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < absentStudents.length) {
          onCheckInStudent(absentStudents[idx]!.id);
          playThemeSound("click");
          idx++;
        } else {

          clearInterval(interval);
          setIsStreaming(false);
          playThemeSound("success");
        }
      }, 1200);
    }
  };

  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const attendancePercentage = Math.round((presentCount / students.length) * 100);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#10B981]/10 rounded-2xl text-[#10B981]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#0F172A]">Student Spatial Attendance</h2>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold text-[10px] uppercase rounded-full tracking-wider">
                Simulation Mode (RFID Hardware Demo)
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Simulated RFID gate check-ins and real-time arrival verification feed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartRfidStream}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 ${
              isStreaming
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-purple-100 text-[#7C3AED] hover:bg-purple-200"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isStreaming ? "RFID Streaming Live..." : "Start Live RFID Stream"}</span>
          </button>

          <button
            onClick={handleBatchCheckIn}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#10B981]/20 transition-all flex items-center gap-2"
          >
            <Footprints className="w-4 h-4 text-white" />
            <span>Check In All Students</span>
          </button>
        </div>
      </div>

      {/* Progress & Gate Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">
              Daily Attendance Rate
            </span>
            <span className="text-sm font-extrabold text-[#10B981] font-mono">{attendancePercentage}% Present</span>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#64748B] font-semibold">
              <span>Present: {presentCount} Students</span>
              <span>Pending: {students.length - presentCount} Students</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold">
            <span>Gate Scanner</span>
            <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
          </div>
          <div className="text-sm font-extrabold text-[#0F172A] font-mono mt-2">{activeZone}</div>
          <div className="mt-4 text-[11px] text-[#10B981] font-bold flex items-center gap-1.5 bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            Scanner Active
          </div>
        </div>
      </div>

      {/* Target Gate Selector: Student vs Faculty */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setGateTarget('STUDENT')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            gateTarget === 'STUDENT' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 inline mr-1.5" /> Student Gate Roster ({students.length})
        </button>
        <button
          onClick={() => setGateTarget('FACULTY')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            gateTarget === 'FACULTY' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 inline mr-1.5" /> Faculty & Staff Gate ({staffList.length})
        </button>
      </div>

      {/* Roster Grid */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide">
            {gateTarget === 'STUDENT' ? 'Student Roster (Click to verify arrival)' : 'Faculty & Staff Gate Roster (Click to verify arrival)'}
          </h3>
          <button
            onClick={() =>
              onOpenExplainability({
                title: gateTarget === 'STUDENT' ? 'Friday Attendance Pattern' : 'Faculty Staffing Gate Feed',
                confidenceScore: 0.91,
                domain: 'attendance',
                reasoningBullets: [
                  'Real-time gate scanner feed active across Gate 1',
                  'Staff attendance updates feed directly into staffing prediction engine',
                ],
                recommendedAction: 'Send automated parent/admin notification',
              })
            }
            className="text-xs text-[#7C3AED] hover:underline font-bold"
          >
            How Sure the AI Is
          </button>
        </div>

        {gateTarget === 'STUDENT' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {students.map((student) => {
              const isPresent = student.status === 'PRESENT';
              return (
                <div
                  key={student.id}
                  onClick={() => handleGateCheckIn(student.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                    isPresent
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#0F172A]'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-extrabold text-sm text-[#0F172A]">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#0F172A]">{student.name}</div>
                      <div className="text-[11px] text-[#64748B] font-semibold">{student.grade}</div>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      isPresent
                        ? 'bg-[#10B981] border-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                        : 'border-slate-300 text-slate-300 bg-white'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {staffList.map((staff) => {
              const isPresent = staff.status === 'PRESENT';
              return (
                <div
                  key={staff.id}
                  onClick={() => handleStaffCheckIn(staff.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                    isPresent
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-950'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-sm font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#0F172A]">{staff.name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{staff.department}</div>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      isPresent
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'border-slate-300 text-slate-300 bg-white'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
