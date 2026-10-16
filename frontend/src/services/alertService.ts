import type { AlertSeverity, AlertStatus, SecurityAlert } from '@/types'
import { apiFetch, toQueryString } from './api'

interface SecurityAlertResponse {
  id: string
  owner_id: string
  camera_id: string | null
  camera_name: string | null
  type: string
  detection_info: string | null
  severity: AlertSeverity
  status: AlertStatus
  occurred_at: string
  resolved_at: string | null
  created_at: string
}

function toAlert(a: SecurityAlertResponse): SecurityAlert {
  return {
    id: a.id,
    type: a.type,
    cameraId: a.camera_id,
    cameraName: a.camera_name,
    timestamp: a.occurred_at,
    detectionInfo: a.detection_info,
    severity: a.severity,
    status: a.status,
  }
}

export async function getAlerts(): Promise<SecurityAlert[]> {
  const alerts = await apiFetch<SecurityAlertResponse[]>(`/alerts${toQueryString({  })}`)
  return alerts.map(toAlert)
}

export async function resolveAlert(id: string): Promise<SecurityAlert> {
  const alert = await apiFetch<SecurityAlertResponse>(`/alerts/${id}/resolve`, { method: 'PATCH' })
  return toAlert(alert)
}
