import { serviceContainer } from '../services/container/ServiceContainer';

export type AuthEventType =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'MFA_ENABLED'
  | 'DEVICE_REGISTERED'
  | 'SESSION_EXPIRED'
  | 'PERMISSION_DENIED';

export interface AuthDomainEvent {
  id: string;
  type: AuthEventType;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  details: string;
  orgId: string;
}

export class AuthEventBus {
  private static listeners: Set<(evt: AuthDomainEvent) => void> = new Set();

  public static emit(type: AuthEventType, actorEmail: string, role: string, details: string, orgId: string = 'org-central-high'): AuthDomainEvent {
    const event: AuthDomainEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toISOString(),
      actorEmail,
      actorRole: role,
      details,
      orgId,
    };

    // Log to Audit System
    const audit = serviceContainer.getAuditService();
    audit.logAction(actorEmail, actorEmail, role, type, details);

    this.listeners.forEach((listener) => listener(event));
    return event;
  }

  public static subscribe(callback: (evt: AuthDomainEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}
