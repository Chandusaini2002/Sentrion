import type { AlertSeverity, AlertStatus, SecurityEvent } from '@/types'
import { apiFetch, toQueryString } from './api'

interface SecurityEventResponse {
  id: string
  owner_id: string
  camera_id: string | null
  camera_name: string | null
  event_type: string
  detection_result: string | null
  severity: AlertSeverity
  status: AlertStatus
  occurred_at: string
  created_at: string
}

function toSecurityEvent(e: SecurityEventResponse): SecurityEvent {
  return {
    id: e.id,
    timestamp: e.occurred_at,
    cameraId: e.camera_id,
    cameraName: e.camera_name,
    eventType: e.event_type,
    detectionResult: e.detection_result,
    severity: e.severity,
    status: e.status,
  }
}

export async function getSecurityEvents(limit = 5): Promise<SecurityEvent[]> {
  const events = await apiFetch<SecurityEventResponse[]>(
    `/security-events${toQueryString({  limit })}`,
  )
  return events.map(toSecurityEvent)
}
