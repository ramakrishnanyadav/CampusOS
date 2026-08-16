import { AuditRecord, AuditSearchQuery } from '../../repositories/interfaces/IAuditRepository';

export interface IAuditService {
  logAction(actorName: string, actorEmail: string, role: string, action: string, targetResource: string, status?: 'SUCCESS' | 'FAILED'): AuditRecord;
  searchLogs(query: AuditSearchQuery): AuditRecord[];
  exportCSV(): string;
  exportJSON(): string;
}
