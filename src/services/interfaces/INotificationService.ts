import { NotificationPriority } from '../../config/notifications';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  channel: string;
}

export interface INotificationService {
  dispatch(title: string, message: string, priority: NotificationPriority, channel?: string): AppNotification;
  getNotifications(): AppNotification[];
  markAsRead(id: string): void;
  getUnreadCount(): number;
}
