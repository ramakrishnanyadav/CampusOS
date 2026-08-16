export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  role: string;
  action: string;
  targetResource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface AuditSearchQuery {
  query?: string;
  role?: string;
  action?: string;
  status?: 'SUCCESS' | 'FAILED';
  startDate?: string;
  endDate?: string;
}

export interface IAuditRepository {
  insert(record: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord;
  search(query: AuditSearchQuery): AuditRecord[];
  exportCSV(): string;
  exportJSON(): string;
}
