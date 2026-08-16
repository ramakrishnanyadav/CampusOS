import { IAuditRepository, AuditRecord, AuditSearchQuery } from '../interfaces/IAuditRepository';
import { db } from '../../config/firebase';
import { collection, setDoc, doc, getDocs } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_KEY = 'campusos_audit_logs_cache';

const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'AUDIT-1001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorName: 'Dr. Aris Vance',
    actorEmail: 'a.vance@centralhigh.edu',
    role: 'ADMIN',
    action: 'TIMETABLE_SOLVER_EXECUTE',
    targetResource: 'Grade 10 Schedule (0 Collisions)',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS',
  },
  {
    id: 'AUDIT-1002',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actorName: 'Prof. Elena Rostova',
    actorEmail: 'e.rostova@centralhigh.edu',
    role: 'STAFF',
    action: 'ATTENDANCE_CHECKIN_BATCH',
    targetResource: 'Gate 1 RFID Scanner (1,248 Students)',
    ipAddress: '192.168.1.112',
    status: 'SUCCESS',
  },
  {
    id: 'AUDIT-1003',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    actorName: 'System OCR Worker',
    actorEmail: 'worker-ocr@campusos.internal',
    role: 'ADMIN',
    action: 'DOCUMENT_OCR_PROCESS',
    targetResource: 'Hindi Admission Form PDF (99.4% Conf)',
    ipAddress: '10.0.4.12',
    status: 'SUCCESS',
  },
];

export class FirestoreAuditRepository implements IAuditRepository {
  private records: AuditRecord[] = [];

  constructor(private orgId: string = DEFAULT_ORG_ID) {
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try { this.records = JSON.parse(cached); } catch { this.records = [...INITIAL_AUDIT_LOGS]; }
    } else {
      this.records = [...INITIAL_AUDIT_LOGS];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(this.records));
    }
  }

  private get collectionRef() {
    return collection(db, 'orgs', this.orgId, 'audit_logs');
  }

  public insert(data: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord {
    const record: AuditRecord = {
      ...data,
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };

    this.records.unshift(record);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(this.records));

    // Async persistent write to Firestore
    setDoc(doc(db, 'orgs', this.orgId, 'audit_logs', record.id), record).catch((err) => {
      console.warn(`FirestoreAuditRepository[${this.orgId}]: Firestore persistent write warning`, err);
    });

    return record;
  }

  public search(queryFilter: AuditSearchQuery): AuditRecord[] {
    let result = [...this.records];

    if (queryFilter.query) {
      const q = queryFilter.query.toLowerCase();
      result = result.filter(
        (r) =>
          r.actorName.toLowerCase().includes(q) ||
          r.actorEmail.toLowerCase().includes(q) ||
          r.action.toLowerCase().includes(q) ||
          r.targetResource.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    if (queryFilter.role && queryFilter.role !== 'ALL') {
      result = result.filter((r) => r.role === queryFilter.role);
    }

    if (queryFilter.status) {
      result = result.filter((r) => r.status === queryFilter.status);
    }

    return result;
  }

  /**
   * RFC 4180 compliant CSV export with proper internal quote escaping (Fix for Finding #14).
   */
  public exportCSV(): string {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Target Resource', 'IP Address', 'Status'];
    const rows = this.records.map((r) => [
      r.id,
      r.timestamp,
      r.actorName,
      r.actorEmail,
      r.role,
      r.action,
      r.targetResource,
      r.ipAddress,
      r.status,
    ]);

    const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const csvLines = [
      headers.map(escapeCell).join(','),
      ...rows.map((row) => row.map(escapeCell).join(',')),
    ];

    return csvLines.join('\n');
  }

  public exportJSON(): string {
    return JSON.stringify(this.records, null, 2);
  }
}
