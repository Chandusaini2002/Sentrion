/**
 * Represents a single row in the audit-style Activity log.
 * Mirrors backend/app/schemas/activity.py `ActivityLogEntryRead`.
 */
export type ActivityType =
  | 'camera_connected'
  | 'camera_disconnected'
  | 'person_detected'
  | 'face_matched'
  | 'unknown_person_detected'
  | 'profile_updated'
  | 'camera_settings_changed'
  | 'security_alert_generated'

export interface ActivityLogEntry {
  id: string
  type: ActivityType
  title: string
  description: string
  /** ISO 8601 timestamp. */
  timestamp: string
  /** Present when the entry is linked to a specific camera. Not currently shown in the UI. */
  cameraId?: string | null
}
