export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export const CONFIG_NOTIFICATIONS = {
  PRIORITY_INTERRUPTS: ['CRITICAL'] as NotificationPriority[],
  CHANNELS: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
  RETRY_LIMIT: 3,
  RETRY_DELAY_MS: 1000,
};
