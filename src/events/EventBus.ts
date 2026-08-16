export type DomainEventType =
  | 'DOCUMENT_EXTRACTED'
  | 'TIMETABLE_SOLVED'
  | 'ATTENDANCE_SCANNED'
  | 'STAFFING_PREDICTED'
  | 'INCIDENT_RESOLVED'
  | 'WORKFLOW_STATE_CHANGED'
  | 'SYSTEM_ALERT';

export interface DomainEventPayload {
  eventId: string;
  eventType: DomainEventType;
  timestamp: string;
  actor: string;
  role: string;
  resource: string;
  payloadData?: any;
}

type EventHandler = (event: DomainEventPayload) => void;

class DomainEventBus {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map();

  public subscribe(type: DomainEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const list = this.handlers.get(type);
      if (list) {
        this.handlers.set(
          type,
          list.filter((h) => h !== handler)
        );
      }
    };
  }

  public emit(eventType: DomainEventType, actor: string, role: string, resource: string, payloadData?: any): void {
    const event: DomainEventPayload = {
      eventId: `event-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventType,
      timestamp: new Date().toISOString(),
      actor,
      role,
      resource,
      payloadData,
    };

    const listeners = this.handlers.get(eventType) || [];
    listeners.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error(`Error in EventBus handler for ${eventType}:`, err);
      }
    });
  }
}

export const eventBus = new DomainEventBus();
