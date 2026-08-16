import { IVersionRepository, TimetableVersion } from '../interfaces/IVersionRepository';
import { TimetableSlot } from '../../types';

export class InMemoryVersionRepository implements IVersionRepository {
  private versions: TimetableVersion[] = [];

  constructor() {
    // Initial Seed Version
    this.versions.push({
      versionId: 'v1.0',
      versionLabel: 'v1.0 Baseline Draft',
      timestamp: '08:00 AM',
      createdBy: 'Dr. Aris Vance',
      description: 'Initial semester master schedule',
      slotsSnapshot: [],
    });
  }

  public saveNewVersion(
    label: string,
    createdBy: string,
    description: string,
    slots: TimetableSlot[]
  ): TimetableVersion {
    const versionNumber = (this.versions.length + 1).toFixed(1);
    const version: TimetableVersion = {
      versionId: `v${versionNumber}`,
      versionLabel: label || `v${versionNumber} Snapshot`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy,
      description,
      slotsSnapshot: JSON.parse(JSON.stringify(slots)),
    };
    this.versions.unshift(version);
    return version;
  }

  public getVersions(): TimetableVersion[] {
    return this.versions;
  }

  public getVersionById(versionId: string): TimetableVersion | undefined {
    return this.versions.find((v) => v.versionId === versionId);
  }
}
