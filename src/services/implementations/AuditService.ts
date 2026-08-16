import { IAuditService } from '../interfaces/IAuditService';
import { IAuditRepository, AuditRecord, AuditSearchQuery } from '../../repositories/interfaces/IAuditRepository';
import { eventBus } from '../../events/EventBus';

export class AuditService implements IAuditService {
  constructor(private auditRepo: IAuditRepository) {
    // Subscribe to EventBus to log all domain events automatically!
    eventBus.subscribe('DOCUMENT_EXTRACTED', (event) => {
      this.logAction(event.actor, `${event.actor.toLowerCase().replace(/\s+/g, '.')}@centralhigh.edu`, event.role, 'Extracted Multilingual OCR Form', event.resource);
    });

    eventBus.subscribe('TIMETABLE_SOLVED', (event) => {
      this.logAction(event.actor, `${event.actor.toLowerCase().replace(/\s+/g, '.')}@centralhigh.edu`, event.role, 'Resolved Timetable Double-Booking', event.resource);
    });

    eventBus.subscribe('ATTENDANCE_SCANNED', (event) => {
      this.logAction(event.actor, `${event.actor.toLowerCase().replace(/\s+/g, '.')}@centralhigh.edu`, event.role, 'Verified RFID Gate Attendance', event.resource);
    });
  }

  public logAction(
    actorName: string,
    actorEmail: string,
    role: string,
    action: string,
    targetResource: string,
    status: 'SUCCESS' | 'FAILED' = 'SUCCESS'
  ): AuditRecord {
    return this.auditRepo.insert({
      actorName,
      actorEmail,
      role,
      action,
      targetResource,
      ipAddress: '192.168.1.10',
      status,
    });
  }

  public searchLogs(query: AuditSearchQuery): AuditRecord[] {
    return this.auditRepo.search(query);
  }

  public exportCSV(): string {
    return this.auditRepo.exportCSV();
  }

  public exportJSON(): string {
    return this.auditRepo.exportJSON();
  }
}
