import { RoomItem } from '../../types';

export interface IRoomRepository {
  getAllRooms(): Promise<RoomItem[]>;
  addRoom(room: Omit<RoomItem, 'id'>): Promise<RoomItem>;
  updateRoom(id: string, updates: Partial<RoomItem>): Promise<void>;
  deleteRoom(id: string): Promise<void>;
  subscribeToRooms(callback: (rooms: RoomItem[]) => void): () => void;
}
