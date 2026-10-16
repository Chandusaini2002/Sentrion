/**
 * Represents a bell-icon notification in the top bar.
 * Mirrors backend/app/schemas/notification.py `NotificationRead`.
 * Delivered over REST for now; a WebSocket push channel is a later stage.
 */
export type NotificationSeverity = 'info' | 'warning' | 'critical'

export interface AppNotification {
  id: string
  title: string
  message: string
  /** ISO 8601 timestamp. */
  timestamp: string
  read: boolean
  severity?: NotificationSeverity
}
