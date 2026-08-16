import { TimetableSlot } from '../../types';

export interface TimetableVersion {
  versionId: string;
  versionLabel: string;
  timestamp: string;
  createdBy: string;
  description: string;
  slotsSnapshot: TimetableSlot[];
}

export interface IVersionRepository {
  saveNewVersion(label: string, createdBy: string, description: string, slots: TimetableSlot[]): TimetableVersion;
  getVersions(): TimetableVersion[];
  getVersionById(versionId: string): TimetableVersion | undefined;
}
