import { INotificationService, AppNotification } from '../interfaces/INotificationService';
import { NotificationPriority } from '../../config/notifications';
import { eventBus } from '../../events/EventBus';

export class NotificationService implements INotificationService {
  private notifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'AP Physics Room 302 Double-Booking Alert',
      message: 'Critical scheduling collision detected between Grade 10 AP Physics and Grade 12 Biology.',
      priority: 'CRITICAL',
      timestamp: '08:30 AM',
      read: false,
      channel: 'IN_APP',
    },
    {
      id: 'notif-2',
      title: '4 Hindi Medical Waivers Extracted',
      message: 'Multilingual Vision OCR extracted physical paper forms into student records.',
      priority: 'HIGH',
      timestamp: '08:45 AM',
      read: false,
      channel: 'EMAIL',
    },
  ];

  constructor() {
    // EventBus Automatic Notification Dispatcher
    eventBus.subscribe('TIMETABLE_SOLVED', (event) => {
      this.dispatch(
        'Timetable Collision Solved',
        `Reassigned substitute teacher for ${event.resource}`,
        'HIGH',
        'SMS'
      );
    });

    eventBus.subscribe('DOCUMENT_EXTRACTED', (event) => {
      this.dispatch(
        'Paper Form OCR Extracted',
        `Extracted document schema for ${event.resource}`,
        'MEDIUM',
        'IN_APP'
      );
    });
  }

  public dispatch(
    title: string,
    message: string,
    priority: NotificationPriority,
    channel: string = 'IN_APP'
  ): AppNotification {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      priority,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      channel,
    };
    this.notifications.unshift(notif);
    return notif;
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public markAsRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }
}
