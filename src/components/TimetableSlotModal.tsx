import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, BookOpen, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TimetableSlot } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface TimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotToEdit?: TimetableSlot | null;
  initialDay?: string;
  defaultDay?: string;
  initialPeriod?: number;
  defaultPeriod?: number;
  initialGrade?: string;
  selectedGrade?: string;
  onSaveSlot?: (slot: Omit<TimetableSlot, 'id'> & { id?: string }) => void;
  onSave?: (slot: Omit<TimetableSlot, 'id'> & { id?: string }) => void;
  onDeleteSlot?: (id: string) => void;
}

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  isOpen,
  onClose,
  slotToEdit,
  initialDay,
  defaultDay = 'Mon',
  initialPeriod,
  defaultPeriod = 1,
  initialGrade,
  selectedGrade = 'Grade 10',
  onSaveSlot,
  onSave,
  onDeleteSlot,
}) => {
  const effectiveDay = (initialDay || defaultDay) as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  const effectivePeriod = initialPeriod || defaultPeriod;
  const effectiveGrade = initialGrade || selectedGrade;

  const { playThemeSound } = useTheme();

  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>(effectiveDay);
  const [period, setPeriod] = useState(effectivePeriod);
  const [grade, setGrade] = useState(effectiveGrade);

  const days: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const periods = [
    { period: 1, label: 'Period 1 (08:30)' },
    { period: 2, label: 'Period 2 (09:20)' },
    { period: 3, label: 'Period 3 (10:10)' },
    { period: 4, label: 'Period 4 (11:15)' },
    { period: 5, label: 'Period 5 (12:05)' },
  ];
  const grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const teachers = [
    'Dr. Aris Vance',
    'Prof. Elena Rostova',
    'Coach Mark Torres',
    'Mr. David Miller',
    'Mrs. Maya Patel',
    'Dr. Sarah Jenkins',
  ];

  const rooms = [
    'Science Wing 302',
    'Block A 104',
    'Block B 201',
    'Main Gymnasium',
    'CS Lab 2',
    'Auditorium Hall',
    'Arts Studio',
  ];

  useEffect(() => {
    if (slotToEdit) {
      setSubject(slotToEdit.subject);
      setTeacher(slotToEdit.teacher);
      setRoom(slotToEdit.room);
      setDay(slotToEdit.day);
      setPeriod(slotToEdit.period);
      setGrade(slotToEdit.grade);
    } else {
      setSubject('AP Computer Science');
      setTeacher('Dr. Sarah Jenkins');
      setRoom('CS Lab 2');
      setDay(effectiveDay);
      setPeriod(effectivePeriod);
      setGrade(effectiveGrade);
    }
  }, [slotToEdit, effectiveDay, effectivePeriod, effectiveGrade, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playThemeSound('success');
    const foundPeriod = periods.find((p) => p.period === period);
    const labelSegment = foundPeriod ? foundPeriod.label.split(' ')[1] : undefined;
    const timeLabel = labelSegment ? labelSegment.replace('(', '').replace(')', '') : '08:30';

    const saveHandler = onSaveSlot || onSave;
    if (saveHandler) {
      saveHandler({
        id: slotToEdit ? slotToEdit.id : undefined,
        day,
        period,
        timeLabel,
        grade,
        subject,
        teacher,
        room,
        isConflict: false,
        signalStrength: 15,
      });
    }
    onClose();
  };


  const handleDelete = () => {
    if (slotToEdit && onDeleteSlot) {
      playThemeSound('action');
      onDeleteSlot(slotToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 relative">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">
                {slotToEdit ? 'Edit Class Slot' : 'Add New Class Slot'}
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                {slotToEdit ? 'Modify teacher, room, or schedule' : 'Schedule a new class period'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Day of Week</label>
              <select
                onChange={(e) => setDay(e.target.value as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')}

                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
            >
              {periods.map((p) => (
                <option key={p.period} value={p.period}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Subject / Course Name</label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                placeholder="AP Physics C"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Teacher</label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
              >
                {teachers.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Classroom / Room</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
              >
                {rooms.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {slotToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Slot</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playThemeSound('click');
                  onClose();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{slotToEdit ? 'Update Class Slot' : 'Create Class Slot'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
