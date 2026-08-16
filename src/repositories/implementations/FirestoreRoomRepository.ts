import { IRoomRepository } from '../interfaces/IRoomRepository';
import { RoomItem } from '../../types';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_KEY = 'campusos_rooms_directory';

export const DEFAULT_CAMPUS_ROOMS: RoomItem[] = [
  { id: 'rm-101', name: 'Classroom 101', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-102', name: 'Classroom 102', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-103', name: 'Classroom 103', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-104', name: 'Classroom 104 (Block A 104)', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-105', name: 'Classroom 105', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-106', name: 'Classroom 106', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-107', name: 'Classroom 107', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-108', name: 'Classroom 108', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-109', name: 'Classroom 109', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-110', name: 'Classroom 110', type: 'General Classroom', capacity: 35, building: 'Academic Block A', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-111', name: 'Classroom 111', type: 'General Classroom', capacity: 35, building: 'Academic Block B', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-112', name: 'Classroom 112', type: 'General Classroom', capacity: 35, building: 'Academic Block B', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-113', name: 'Classroom 113', type: 'General Classroom', capacity: 35, building: 'Academic Block B', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-114', name: 'Classroom 114', type: 'General Classroom', capacity: 35, building: 'Academic Block B', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-115', name: 'Classroom 115 (Block B 201)', type: 'General Classroom', capacity: 35, building: 'Academic Block B', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-phy302', name: 'AP Physics Lab (Science Wing 302)', type: 'Science Lab', capacity: 30, building: 'Science Wing', floor: 3, isAccessible: true, isAvailable: true },
  { id: 'rm-chem304', name: 'Chemistry Lab 304', type: 'Science Lab', capacity: 30, building: 'Science Wing', floor: 3, isAccessible: true, isAvailable: true },
  { id: 'rm-bio306', name: 'Biology Lab 306', type: 'Science Lab', capacity: 30, building: 'Science Wing', floor: 3, isAccessible: true, isAvailable: true },
  { id: 'rm-cs1', name: 'CS Lab 1', type: 'CS Lab', capacity: 30, building: 'Technology Wing', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-cs2', name: 'CS Lab 2', type: 'CS Lab', capacity: 30, building: 'Technology Wing', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-lib1', name: 'Central Academic Library', type: 'Central Library', capacity: 150, building: 'Central Block', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-audi', name: 'Auditorium Hall', type: 'Auditorium', capacity: 500, building: 'Central Performance Center', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-gym', name: 'Main Gymnasium', type: 'Gymnasium', capacity: 200, building: 'Sports Complex', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-pool', name: 'Olympic Aquatic Center', type: 'Swimming Pool', capacity: 100, building: 'Sports Complex', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-canteen', name: 'Campus Student Cafeteria', type: 'Canteen / Cafeteria', capacity: 250, building: 'Student Center', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-med', name: 'Medical Center & Sick Bay', type: 'Medical Bay', capacity: 15, building: 'Student Center', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-exam', name: 'Grand Examination Hall', type: 'Examination Hall', capacity: 400, building: 'Central Block', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-art', name: 'Fine Arts & Music Studio', type: 'Music & Art Studio', capacity: 40, building: 'Arts Wing', floor: 2, isAccessible: true, isAvailable: true },
  { id: 'rm-server', name: 'ICT Main Server Room', type: 'ICT / Server Room', capacity: 10, building: 'Technology Wing', floor: 2, isAccessible: false, isAvailable: true },
  { id: 'rm-sec', name: 'Campus Security & CCTV Command', type: 'Security / CCTV Room', capacity: 15, building: 'Main Arch', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-staffA', name: 'Faculty Staff Room A', type: 'Staff Room', capacity: 25, building: 'Administration Block', floor: 1, isAccessible: true, isAvailable: true },
  { id: 'rm-staffB', name: 'Faculty Staff Room B', type: 'Staff Room', capacity: 25, building: 'Administration Block', floor: 2, isAccessible: true, isAvailable: true },
];

export class FirestoreRoomRepository implements IRoomRepository {
  constructor(private orgId: string = DEFAULT_ORG_ID) {}

  private get collectionRef() {
    return collection(db, 'orgs', this.orgId, 'rooms');
  }

  public async getAllRooms(): Promise<RoomItem[]> {
    try {
      const snap = await getDocs(this.collectionRef);
      if (!snap.empty) {
        const rooms = snap.docs.map((d) => d.data() as RoomItem);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(rooms));
        return rooms;
      }
    } catch (err) {
      console.warn(`FirestoreRoomRepository[${this.orgId}]: Firestore unavailable, fallback to local`, err);
    }

    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }

    localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_CAMPUS_ROOMS));
    return DEFAULT_CAMPUS_ROOMS;
  }

  public async addRoom(room: Omit<RoomItem, 'id'>): Promise<RoomItem> {
    const newRoom: RoomItem = {
      ...room,
      id: `ROOM-${Date.now()}`,
      isAvailable: room.isAvailable ?? true,
    };
    const rooms = await this.getAllRooms();
    rooms.push(newRoom);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rooms));

    try {
      await setDoc(doc(db, 'orgs', this.orgId, 'rooms', newRoom.id), newRoom);
    } catch (err) {
      console.error(`FirestoreRoomRepository[${this.orgId}]: addRoom failed`, err);
      throw err;
    }

    return newRoom;
  }

  public async updateRoom(id: string, updates: Partial<RoomItem>): Promise<void> {
    const rooms = await this.getAllRooms();
    const target = rooms.find((r) => r.id === id);
    if (target) {
      Object.assign(target, updates);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(rooms));
      try {
        await updateDoc(doc(db, 'orgs', this.orgId, 'rooms', id), updates);
      } catch (err) {
        console.error(`FirestoreRoomRepository[${this.orgId}]: updateRoom failed`, err);
        throw err;
      }
    }
  }

  public async deleteRoom(id: string): Promise<void> {
    const rooms = await this.getAllRooms();
    const filtered = rooms.filter((r) => r.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'orgs', this.orgId, 'rooms', id));
    } catch (err) {
      console.error(`FirestoreRoomRepository[${this.orgId}]: deleteRoom failed`, err);
      throw err;
    }
  }

  public subscribeToRooms(callback: (rooms: RoomItem[]) => void): () => void {
    try {
      return onSnapshot(
        this.collectionRef,
        (snap) => {
          if (!snap.empty) {
            const rooms = snap.docs.map((d) => d.data() as RoomItem);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(rooms));
            callback(rooms);
          }
        },
        (err) => console.warn(`FirestoreRoomRepository[${this.orgId}] Listener warning:`, err)
      );
    } catch (e) {
      return () => {};
    }
  }
}
