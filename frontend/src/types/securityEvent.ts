import type { AlertSeverity, AlertStatus } from './alert'

/**
 * Represents a row in the dashboard's "Recent security events" table.
 * Distinct from SecurityAlert in that events are a broader activity
 * feed (they may or may not require action), while alerts are always
 * actionable. Mirrors backend/app/schemas/security_event.py `SecurityEventRead`.
 */
export interface SecurityEvent {
  id: string
  timestamp: string
  cameraId: string | null
  cameraName: string | null
  eventType: string
  detectionResult: string | null
  severity: AlertSeverity
  status: AlertStatus
}
