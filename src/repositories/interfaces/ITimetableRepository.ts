import { TimetableSlot } from '../../types';

export interface ITimetableRepository {
  getAllSlots(): Promise<TimetableSlot[]>;
  saveSlots(slots: TimetableSlot[]): Promise<void>;
  updateSlot(slot: TimetableSlot): Promise<void>;
  subscribeToSlots(callback: (slots: TimetableSlot[]) => void): () => void;
}
