import { IAuditRepository, AuditRecord, AuditSearchQuery } from '../interfaces/IAuditRepository';

const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-001',
    timestamp: '09:30:12 AM',
    actorName: 'Dr. Aris Vance',
    actorEmail: 'dr.vance@centralhigh.edu',
    role: 'ADMIN',
    action: 'Generated Timetable Matrix v2.0',
    targetResource: 'Science Wing 302',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS',
  },
  {
    id: 'aud-002',
    timestamp: '09:15:44 AM',
    actorName: 'Prof. Elena Rostova',
    actorEmail: 'e.rostova@centralhigh.edu',
    role: 'STAFF',
    action: 'Extracted Hindi Admission Form OCR',
    targetResource: 'Hindi Waiver Form #884',
    ipAddress: '192.168.1.42',
    status: 'SUCCESS',
  },
  {
    id: 'aud-003',
    timestamp: '08:45:00 AM',
    actorName: 'Dr. Aris Vance',
    actorEmail: 'dr.vance@centralhigh.edu',
    role: 'ADMIN',
    action: 'Updated Infrastructure Directory',
    targetResource: 'Room 101-115 Registered',
    ipAddress: '192.168.1.10',
    status: 'SUCCESS',
  },
];

export class InMemoryAuditRepository implements IAuditRepository {
  private records: AuditRecord[] = [...INITIAL_AUDIT_LOGS];

  public insert(data: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord {
    const record: AuditRecord = {
      ...data,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.records.unshift(record);
    return record;
  }

  public search(queryFilter: AuditSearchQuery): AuditRecord[] {
    return this.records.filter((r) => {
      if (queryFilter.query) {
        const q = queryFilter.query.toLowerCase();
        const matches =
          r.actorName.toLowerCase().includes(q) ||
          r.action.toLowerCase().includes(q) ||
          r.targetResource.toLowerCase().includes(q) ||
          r.ipAddress.includes(q);
        if (!matches) return false;
      }
      if (queryFilter.role && r.role !== queryFilter.role) return false;
      if (queryFilter.status && r.status !== queryFilter.status) return false;
      return true;
    });
  }

  public exportCSV(): string {
    const headers = 'ID,Timestamp,Actor,Email,Role,Action,Resource,IP,Status\n';
    const rows = this.records
      .map(
        (r) =>
          `"${r.id}","${r.timestamp}","${r.actorName}","${r.actorEmail}","${r.role}","${r.action}","${r.targetResource}","${r.ipAddress}","${r.status}"`
      )
      .join('\n');
    return headers + rows;
  }

  public exportJSON(): string {
    return JSON.stringify(this.records, null, 2);
  }
}
