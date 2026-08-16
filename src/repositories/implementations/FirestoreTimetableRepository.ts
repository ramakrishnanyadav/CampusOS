import { ITimetableRepository } from '../interfaces/ITimetableRepository';
import { TimetableSlot } from '../../types';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, onSnapshot, writeBatch } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_KEY = 'campusos_timetable_slots';

export class FirestoreTimetableRepository implements ITimetableRepository {
  constructor(private orgId: string = DEFAULT_ORG_ID) {}

  private get collectionRef() {
    return collection(db, 'orgs', this.orgId, 'timetable_slots');
  }

  public async getAllSlots(): Promise<TimetableSlot[]> {
    try {
      const snap = await getDocs(this.collectionRef);
      if (!snap.empty) {
        const slots = snap.docs.map((d) => d.data() as TimetableSlot);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(slots));
        return slots;
      }
    } catch (err) {
      console.warn(`FirestoreTimetableRepository[${this.orgId}]: Firestore unavailable, fallback to local`, err);
    }

    const cached = localStorage.getItem(LOCAL_KEY);
    return cached ? JSON.parse(cached) : [];
  }

  public async saveSlots(slots: TimetableSlot[]): Promise<void> {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(slots));
    try {
      const batch = writeBatch(db);
      slots.forEach((slot) => {
        const ref = doc(db, 'orgs', this.orgId, 'timetable_slots', slot.id);
        batch.set(ref, slot, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error(`FirestoreTimetableRepository[${this.orgId}]: saveSlots failed`, err);
      throw err;
    }
  }

  public async updateSlot(slot: TimetableSlot): Promise<void> {
    const slots = await this.getAllSlots();
    const idx = slots.findIndex((s) => s.id === slot.id);
    if (idx >= 0) {
      slots[idx] = slot;
    } else {
      slots.push(slot);
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(slots));
    try {
      await setDoc(doc(db, 'orgs', this.orgId, 'timetable_slots', slot.id), slot, { merge: true });
    } catch (err) {
      console.error(`FirestoreTimetableRepository[${this.orgId}]: updateSlot failed`, err);
      throw err;
    }
  }

  public subscribeToSlots(callback: (slots: TimetableSlot[]) => void): () => void {
    try {
      return onSnapshot(
        this.collectionRef,
        (snap) => {
          if (!snap.empty) {
            const slots = snap.docs.map((d) => d.data() as TimetableSlot);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(slots));
            callback(slots);
          }
        },
        (err) => console.warn(`FirestoreTimetableRepository[${this.orgId}] Listener warning:`, err)
      );
    } catch (e) {
      return () => {};
    }
  }
}
