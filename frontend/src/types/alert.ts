/**
 * Represents a security alert.
 * Mirrors backend/app/schemas/alert.py `SecurityAlertRead`. AI-generated
 * alert creation isn't implemented yet — these rows exist today only via
 * scripts/seed_dev_data.py or POST /api/alerts called directly.
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'resolved' | 'unresolved'

export interface SecurityAlert {
  id: string
  type: string
  cameraId: string | null
  /** Null if the alert isn't linked to a camera, or the camera was deleted. */
  cameraName: string | null
  /** ISO 8601 timestamp. */
  timestamp: string
  detectionInfo: string | null
  severity: AlertSeverity
  status: AlertStatus
}

export type AlertFilter =
  | 'all'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'resolved'
  | 'unresolved'
