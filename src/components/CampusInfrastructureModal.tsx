import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Plus,
  CheckCircle2,
  Shield,
  Search,
  Layers,
  MapPin,
  Users,
  Lock,
  Edit3,
  Trash2,
  AlertTriangle,
  Bus,
  Activity,
  Check,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { usePermissions } from '../auth/PermissionContext';
import { RoomItem, RoomCategoryType, BusRoute, TimetableSlot } from '../types';
import { FirestoreRoomRepository } from '../repositories/implementations/FirestoreRoomRepository';
import { serviceContainer } from '../services/container/ServiceContainer';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { useCampusStore } from '../context/CampusStoreContext';

interface CampusInfrastructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LIST: RoomCategoryType[] = [
  'General Classroom',
  'Science Lab',
  'CS Lab',
  'Central Library',
  'Auditorium',
  'Gymnasium',
  'Sports Ground',
  'Staff Room',
  'Swimming Pool',
  'Canteen / Cafeteria',
  'Medical Bay',
  'Examination Hall',
  'Music & Art Studio',
  'ICT / Server Room',
  'Security / CCTV Room',
  'Parking Zone',
  'Generator Room',
  'Other',
];

const DEFAULT_BUSES: BusRoute[] = [
  { id: 'BUS-01', busNumber: 'BUS-01', route: 'Route A — North Campus Express', capacity: 52, driverName: 'Rajesh Sharma', driverContact: '+91 98765 43210', isOperational: true },
  { id: 'BUS-02', busNumber: 'BUS-02', route: 'Route B — Metro Link Feeder', capacity: 48, driverName: 'Suresh Patil', driverContact: '+91 98765 43211', isOperational: true },
  { id: 'BUS-03', busNumber: 'BUS-03', route: 'Route C — South Suburbs Shuttle', capacity: 55, driverName: 'Vikram Singh', driverContact: '+91 98765 43212', isOperational: true },
];

export const CampusInfrastructureModal: React.FC<CampusInfrastructureModalProps> = ({ isOpen, onClose }) => {
  const { playThemeSound } = useTheme();
  const { session, hasCapability, setIsElevatedAccessOpen } = usePermissions();
  const { slots } = useCampusStore();

  const [activeTab, setActiveTab] = useState<'rooms' | 'buses'>('rooms');
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [buses, setBuses] = useState<BusRoute[]>(DEFAULT_BUSES);

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);

  // Delete Guard Block Warning state
  const [blockedDeleteMsg, setBlockedDeleteMsg] = useState<string | null>(null);

  // Form State
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<RoomCategoryType>('General Classroom');
  const [roomCapacity, setRoomCapacity] = useState(35);
  const [roomBuilding, setRoomBuilding] = useState('Academic Block A');
  const [roomFloor, setRoomFloor] = useState(1);
  const [isAccessible, setIsAccessible] = useState(true);

  const roomRepo = new FirestoreRoomRepository();
  const auditService = serviceContainer.getAuditService();

  // Subscribe to live Firestore rooms
  useEffect(() => {
    if (!isOpen) return;
    const unsub = roomRepo.subscribeToRooms((liveRooms) => {
      setRooms(liveRooms);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const canEditInfra = hasCapability('INFRASTRUCTURE_WRITE');

  if (!canEditInfra) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Access Denied</h3>
            <p className="text-xs text-slate-500 mt-1">
              Viewing or editing Campus Infrastructure Directory requires <span className="font-mono text-[#7C3AED] font-bold">INFRASTRUCTURE_WRITE</span> capability.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                onClose();
                setIsElevatedAccessOpen(true);
              }}
              className="px-4 py-2 bg-[#7C3AED] text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Elevate to Admin Mode
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live Aggregate Summaries (Phase 4)
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const classroomCount = rooms.filter((r) => r.type === 'General Classroom').length;
  const labCount = rooms.filter((r) => r.type.includes('Lab')).length;
  const libraryCount = rooms.filter((r) => r.type.includes('Library')).length;
  const audiCount = rooms.filter((r) => r.type.includes('Auditorium')).length;
  const sportsCount = rooms.filter((r) => r.type.includes('Gymnasium') || r.type.includes('Sports') || r.type.includes('Pool')).length;
  const specializedCount = rooms.length - (classroomCount + labCount + libraryCount + audiCount + sportsCount);

  // Group by Building View (Phase 4)
  const buildingMap = rooms.reduce<Record<string, { count: number; capacity: number }>>((acc, r) => {
    const b = r.building || 'Main Campus';
    if (!acc[b]) acc[b] = { count: 0, capacity: 0 };
    acc[b].count += 1;
    acc[b].capacity += r.capacity;
    return acc;
  }, {});

  // Filtered list
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle Add Room (Phase 3)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    playThemeSound('success');

    if (editingRoom) {
      // Edit Room
      await roomRepo.updateRoom(editingRoom.id, {
        name: roomName,
        type: roomType,
        capacity: roomCapacity,
        building: roomBuilding,
        floor: roomFloor,
        isAccessible,
      });

      auditService.logAction(
        session.name,
        session.email,
        session.role,
        'INFRASTRUCTURE_UPDATE',
        `Room ${editingRoom.id} (${roomName}) updated in Firestore`
      );
      setEditingRoom(null);
    } else {
      // Add Room
      const created = await roomRepo.addRoom({
        name: roomName,
        type: roomType,
        capacity: roomCapacity,
        building: roomBuilding,
        floor: roomFloor,
        isAccessible,
        isAvailable: true,
      });

      auditService.logAction(
        session.name,
        session.email,
        session.role,
        'INFRASTRUCTURE_ADD',
        `Registered new room ${created.id} (${created.name}) in ${created.building}`
      );
    }

    resetForm();
  };

  // Handle Delete Room with Active Booking Guard (Phase 3)
  const handleDeleteRoom = async (room: RoomItem) => {
    // Check if room is booked in timetable slots
    const isBooked = slots.some((s) => s.room && (s.room.toLowerCase().includes(room.name.toLowerCase()) || room.name.toLowerCase().includes(s.room.toLowerCase())));

    if (isBooked) {
      playThemeSound('action');
      setBlockedDeleteMsg(`Deletion Blocked: "${room.name}" is currently booked in active timetable schedules. Reassign class slots before deleting!`);
      return;
    }

    setBlockedDeleteMsg(null);
    playThemeSound('click');

    await roomRepo.deleteRoom(room.id);
    auditService.logAction(
      session.name,
      session.email,
      session.role,
      'INFRASTRUCTURE_DELETE',
      `Deleted room ${room.id} (${room.name}) from Firestore inventory`
    );
  };

  const startEdit = (room: RoomItem) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomType((room.type as RoomCategoryType) || 'General Classroom');
    setRoomCapacity(room.capacity);
    setRoomBuilding(room.building);
    setRoomFloor(room.floor || 1);
    setIsAccessible(room.isAccessible ?? true);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setRoomName('');
    setRoomType('General Classroom');
    setRoomCapacity(35);
    setRoomBuilding('Academic Block A');
    setRoomFloor(1);
    setIsAccessible(true);
    setShowAddForm(false);
    setEditingRoom(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto min-h-screen">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-0 relative max-h-[92vh] flex flex-col my-auto">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 relative flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/30 border border-purple-500/40 rounded-2xl backdrop-blur-md">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white tracking-tight">
                Authoritative Campus Infrastructure Directory
              </h3>
              <p className="text-xs text-purple-200 font-medium">
                Live Firestore Room Registry & Bus Fleet Infrastructure Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'rooms' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                🏢 Rooms ({rooms.length})
              </button>
              <button
                onClick={() => setActiveTab('buses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'buses' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                🚌 Bus Fleet ({buses.length})
              </button>
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
        </div>

        {/* Phase 4 Live Aggregate Summary Strip */}
        {activeTab === 'rooms' && (
          <div className="p-4 bg-slate-900 text-white border-b border-slate-800 space-y-3 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Classrooms</span>
                <span className="text-lg font-black text-white">{classroomCount}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Science & CS Labs</span>
                <span className="text-lg font-black text-purple-400">{labCount}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Libraries</span>
                <span className="text-lg font-black text-blue-400">{libraryCount}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Auditoriums</span>
                <span className="text-lg font-black text-amber-400">{audiCount}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Sports & Gym</span>
                <span className="text-lg font-black text-emerald-400">{sportsCount}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Capacity</span>
                <span className="text-lg font-black text-indigo-300">{totalCapacity}</span>
              </div>
            </div>

            {/* Building Breakdown Strip */}
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
              <span className="font-extrabold text-purple-400 uppercase tracking-wider shrink-0">Building Views:</span>
              {Object.entries(buildingMap).map(([bName, bMeta]) => (
                <span key={bName} className="px-2.5 py-0.5 bg-slate-800 rounded-lg border border-slate-700 whitespace-nowrap font-medium">
                  <strong className="text-white">{bName}:</strong> {bMeta.count} rooms ({bMeta.capacity} seats)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Delete Guard Alert Notification */}
        {blockedDeleteMsg && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-xs font-bold animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{blockedDeleteMsg}</span>
            </div>
            <button onClick={() => setBlockedDeleteMsg(null)} className="text-rose-600 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls & Filter Bar */}
        {activeTab === 'rooms' && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search room name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">All 18 Room Categories ({rooms.length})</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (showAddForm && editingRoom) resetForm();
                else setShowAddForm(!showAddForm);
                playThemeSound('click');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{editingRoom ? 'Cancel Edit' : 'Register Custom Room'}</span>
            </button>
          </div>
        )}

        {/* Add/Edit Room Inline Form */}
        {activeTab === 'rooms' && showAddForm && (
          <form onSubmit={handleSaveRoom} className="p-5 bg-purple-50/80 border-b border-purple-200 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3 shrink-0 animate-in fade-in">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-extrabold text-purple-900 uppercase block mb-1">Room Name</label>
              <input
                type="text"
                placeholder="e.g. AP Physics Lab 302"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-purple-900 uppercase block mb-1">Category</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomCategoryType)}
                className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              >
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-purple-900 uppercase block mb-1">Capacity</label>
              <input
                type="number"
                min={1}
                max={2000}
                value={roomCapacity}
                onChange={(e) => setRoomCapacity(parseInt(e.target.value, 10) || 35)}
                className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-purple-900 uppercase block mb-1">Building Wing</label>
              <input
                type="text"
                placeholder="e.g. Academic Block A"
                value={roomBuilding}
                onChange={(e) => setRoomBuilding(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md transition-all"
              >
                {editingRoom ? 'Update Room' : 'Save to Firestore'}
              </button>
            </div>
          </form>
        )}

        {/* Rooms Directory Grid */}
        {activeTab === 'rooms' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Displaying {filteredRooms.length} Registered Infrastructure Spaces</span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Real-Time Firestore Synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-purple-500 transition-all space-y-3 group relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {room.id}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                        {room.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                        {room.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {room.building} {room.floor ? `• Floor ${room.floor}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-bold text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Capacity: {room.capacity}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(room)}
                        className="p-1 text-slate-400 hover:text-purple-600 rounded-md"
                        title="Edit Room"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Delete Room (Guarded)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 5 Bus Fleet Sub-Tab */}
        {activeTab === 'buses' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Campus Transport Fleet & Transit Routes</span>
              <Badge variant="success">3 Vehicles Operational</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buses.map((b) => (
                <div key={b.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-purple-700 text-sm">{b.busNumber}</span>
                    <Badge variant={b.isOperational ? 'success' : 'critical'}>
                      {b.isOperational ? 'ACTIVE ROUTE' : 'IN MAINTENANCE'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{b.route}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Passenger Capacity: {b.capacity} Students</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 font-medium space-y-1">
                    <div>Driver: <strong className="text-slate-800">{b.driverName}</strong></div>
                    <div className="font-mono text-[11px] text-purple-700">{b.driverContact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>AI Scheduler & Wayfinding Map bound to authoritative Firestore room collection</span>
          </div>
          <button
            onClick={() => {
              playThemeSound('click');
              onClose();
            }}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold rounded-xl transition-all"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
