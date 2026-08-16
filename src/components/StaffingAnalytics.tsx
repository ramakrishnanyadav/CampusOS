import React, { useState, useMemo } from 'react';
import { authenticatedFetch } from '../utils/apiClient';
import { DepartmentStaffing, AttendanceStudent } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { BarChart3, Sparkles, Lock, Upload, FileSpreadsheet, CheckCircle2, ArrowRight, Microscope, Calculator, Dumbbell, Laptop, Activity } from "lucide-react";
import { usePermissions } from "../auth/PermissionContext";
import { useCampusStore } from "../context/CampusStoreContext";
import { calculateStaffingPredictions } from "../utils/staffingEngine";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface StaffingAnalyticsProps {
  onOpenExplainability: (item: any) => void;
  students?: AttendanceStudent[];
}


const WEEKLY_DEMAND_FORECAST = [
  { day: "Mon", demandScore: 82, supplyScore: 70 },
  { day: "Tue", demandScore: 65, supplyScore: 80 },
  { day: "Wed", demandScore: 75, supplyScore: 75 },
  { day: "Thu", demandScore: 88, supplyScore: 65 },
  { day: "Fri", demandScore: 95, supplyScore: 55 },
];

export const StaffingAnalytics: React.FC<StaffingAnalyticsProps> = ({ onOpenExplainability, students = [] }) => {
  const { hasCapability, setIsElevatedAccessOpen } = usePermissions();
  const { addToast } = useCampusStore();

  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState<'upload' | 'mapping' | 'review'>('upload');
  const [csvRawText, setCsvRawText] = React.useState('');
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const [csvRawLines, setCsvRawLines] = React.useState<string[]>([]);
  const [columnMap, setColumnMap] = React.useState<{ teacher: number; department: number; date: number; reason: number }>({
    teacher: 0,
    department: 1,
    date: 2,
    reason: 3,
  });

  const [facultyMembers, setFacultyMembers] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    import('../repositories/implementations/FirestoreFacultyRepository').then(({ FirestoreFacultyRepository }) => {
      const repo = new FirestoreFacultyRepository();
      const unsub = repo.subscribeToFaculty((f) => setFacultyMembers(f));
      return () => unsub();
    });
  }, []);

  const sampleCsvData = `Teacher Name,Department,Date,Leave Reason
Prof. Alan Smith,Science & Biology,2026-08-05,Medical Leave
Dr. Sarah Jenkins,Science & Biology,2026-08-05,Conference
Coach Mark Torres,Physical Education & Athletics,2026-08-06,Sports Event`;

  const handleParseCsv = (text: string) => {
    setCsvRawText(text);
    const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) return;

    const headers = lines[0]!.split(',').map((h) => h.trim());

    setCsvHeaders(headers);
    setCsvRawLines(lines.slice(1));

    // Auto-detect default header indices if present
    const tIdx = Math.max(0, headers.findIndex((h) => h.toLowerCase().includes('teacher') || h.toLowerCase().includes('name')));
    const dIdx = Math.max(0, headers.findIndex((h) => h.toLowerCase().includes('dept') || h.toLowerCase().includes('department')));
    const dtIdx = Math.max(0, headers.findIndex((h) => h.toLowerCase().includes('date')));
    const rIdx = Math.max(0, headers.findIndex((h) => h.toLowerCase().includes('reason') || h.toLowerCase().includes('leave')));

    setColumnMap({
      teacher: tIdx >= 0 ? tIdx : 0,
      department: dIdx >= 0 ? dIdx : 1,
      date: dtIdx >= 0 ? dtIdx : 2,
      reason: rIdx >= 0 ? rIdx : 3,
    });

    setWizardStep('mapping');
  };

  const handleApplyColumnMapping = () => {
    const rows = csvRawLines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        teacher: parts[columnMap.teacher] || 'Unknown Faculty',
        department: parts[columnMap.department] || 'General Education',
        date: parts[columnMap.date] || new Date().toISOString().split('T')[0],
        reason: parts[columnMap.reason] || 'Absence',
      };
    });

    setParsedRows(rows);
    setWizardStep('review');
  };

  const handleCommitIngest = async () => {
    setIsSubmitting(true);
    try {
      const res = await authenticatedFetch('/api/staffing/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRows, sourceFileName: 'Staffing_Import.csv' }),
      });
      const data = await res.json();
      if (data.success) {
        addToast({
          type: 'success',
          title: 'CSV Ingestion Complete',
          message: `Ingested ${data.ingestedCount} records. ML Model re-scored capacity probability to ${data.rescoredProbability}%.`,
        });
        setShowUploadModal(false);
        setWizardStep('upload');
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Upload Failed', message: 'Could not submit CSV records.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const STAFFING_DATA = calculateStaffingPredictions(
    students,
    [{ teacherName: "Dr. Aris Vance", department: "Science & Biology", date: "2026-08-01", reason: "Conference Leave" }],
    facultyMembers
  );

  if (!hasCapability("STAFFING_WRITE")) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-xl text-slate-900">Access Denied</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Predictive Staffing Analytics requires <span className="font-mono text-[#7C3AED] font-bold">STAFFING_WRITE</span> administrator capability.
          </p>
        </div>
        <button
          onClick={() => setIsElevatedAccessOpen(true)}
          className="px-5 py-2.5 bg-[#7C3AED] text-white font-extrabold text-xs rounded-xl shadow-md"
        >
          Elevate to Administrator Mode
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#7C3AED]/10 rounded-2xl text-[#7C3AED]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A]">Staffing Capacity & HR Analytics</h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Teacher availability forecasts and substitute pool planning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Staffing CSV/Excel</span>
          </button>

          <button
            onClick={() =>
              onOpenExplainability({
                title: 'Friday Science Shortage Risk',
                confidenceScore: 0.942,
                domain: 'staffing',
                reasoningBullets: [
                  '3 Science teachers requested leave for annual conference',
                  'Mid-term examination schedule requires 4 lab proctors on Friday',
                  'Historical Friday absence dip (+14% probability)',
                ],
                recommendedAction: 'Pre-assign substitute pool candidate Dr. Sarah Jenkins',
              })
            }
            className="text-xs text-[#7C3AED] hover:underline font-bold"
          >
            How Sure the AI Is
          </button>

          <div className="flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-3 py-1.5 rounded-full text-xs text-[#7C3AED] font-bold">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span>AI 94% Sure</span>
          </div>
        </div>
      </div>

      {/* Forecast Banner */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">
            Weekly Teacher Demand Peak
          </span>
          <span className="text-xs font-bold text-[#7C3AED] font-mono">Peak: Friday 3:15 PM</span>
        </div>

        <div className="h-16 flex items-end justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
          {WEEKLY_DEMAND_FORECAST.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-[#7C3AED] rounded-t flex items-center justify-center text-[10px] text-white font-bold font-mono shadow-sm"
                style={{ height: `${item.demandScore * 0.5}px` }}
              >
                {item.demandScore}%
              </div>
              <span className="text-[10px] text-[#64748B] font-bold font-mono">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-4 pb-2 border-b border-slate-200">
            Teachers Active vs Needed
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STAFFING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="department" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }} />
                <Bar dataKey="activeTeachers" fill="#10B981" radius={[4, 4, 0, 0]} name="Active Teachers" />
                <Bar dataKey="requiredTeachers" fill="#EF4444" radius={[4, 4, 0, 0]} name="Required Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-4 pb-2 border-b border-slate-200">
            Weekly Shortage Risk Forecast
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DEMAND_FORECAST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }} />
                <Area type="monotone" dataKey="demandScore" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} name="Demand Load" />
                <Area type="monotone" dataKey="supplyScore" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Supply Capacity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAFFING_DATA.map((dept) => (
          <div key={dept.department} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-center">
                  {dept.iconName === 'Calculator' ? (
                    <Calculator className="w-5 h-5 text-indigo-600" />
                  ) : dept.iconName === 'Laptop' ? (
                    <Laptop className="w-5 h-5 text-blue-600" />
                  ) : dept.iconName === 'Dumbbell' ? (
                    <Dumbbell className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Microscope className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                    dept.shortageProbability > 50
                      ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                      : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  }`}
                >
                  {dept.shortageProbability}% Risk
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] mb-1">{dept.department}</h4>
              <p className="text-xs text-[#64748B] font-medium">
                Staffing: {dept.activeTeachers} / {dept.requiredTeachers}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-[#7C3AED] font-bold block mb-0.5">Peak Risk: {dept.peakDays.join(", ")}</span>
              <span className="text-[#64748B]">Subs: {dept.suggestedSubs.join(", ")}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CSV / Excel Ingestion Wizard Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" className="max-w-xl w-full space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Excel / CSV Staffing Data Wizard</h3>
                  <p className="text-xs text-slate-500 font-medium">Ingest historical leave logs to re-score logistic regression model</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>Close</Button>
            </div>

            {wizardStep === 'upload' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Paste CSV Text or Load Sample Template</label>
                  <textarea
                    rows={6}
                    value={csvRawText || sampleCsvData}
                    onChange={(e) => setCsvRawText(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-purple-600 mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCsvRawText(sampleCsvData)}
                  >
                    Load Sample CSV
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => handleParseCsv(csvRawText || sampleCsvData)}
                  >
                    Parse Header Columns
                  </Button>
                </div>
              </div>
            ) : wizardStep === 'mapping' ? (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium">
                  <strong>Interactive Column Mapping:</strong> Select which CSV column matches each required leave record field below.
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Faculty Name Field</label>
                    <select
                      value={columnMap.teacher}
                      onChange={(e) => setColumnMap({ ...columnMap, teacher: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Column {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department Field</label>
                    <select
                      value={columnMap.department}
                      onChange={(e) => setColumnMap({ ...columnMap, department: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Column {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Leave Date Field</label>
                    <select
                      value={columnMap.date}
                      onChange={(e) => setColumnMap({ ...columnMap, date: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Column {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Reason for Leave</label>
                    <select
                      value={columnMap.reason}
                      onChange={(e) => setColumnMap({ ...columnMap, reason: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Column {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button variant="ghost" size="sm" onClick={() => setWizardStep('upload')}>Back</Button>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={handleApplyColumnMapping}
                  >
                    Apply Mapping & Review Records
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Parsed Preview ({parsedRows.length} Faculty Leave Records)</h4>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl bg-slate-50 p-2 text-xs font-mono">
                  {parsedRows.map((r, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0 text-slate-700">
                      <span className="font-extrabold text-slate-900">{r.teacher}</span>
                      <span>{r.department}</span>
                      <span className="text-purple-700">{r.reason}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button variant="ghost" size="sm" onClick={() => setWizardStep('upload')}>Back to CSV</Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    disabled={isSubmitting}
                    onClick={handleCommitIngest}
                  >
                    {isSubmitting ? 'Ingesting & Re-scoring...' : 'Commit to Firestore & Re-score ML'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
