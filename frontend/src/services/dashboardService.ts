import { apiFetch, toQueryString } from './api'

interface DashboardStatsResponse {
  user_id: string
  total_cameras: number
  cameras_online: number
  cameras_offline: number
  active_alerts: number
  people_detected_today: number
  security_events_7d: number
}

export interface DashboardStats {
  totalCameras: number
  camerasOnline: number
  camerasOffline: number
  activeAlerts: number
  peopleDetected: number
  securityEvents: number
}

function toDashboardStats(s: DashboardStatsResponse): DashboardStats {
  return {
    totalCameras: s.total_cameras,
    camerasOnline: s.cameras_online,
    camerasOffline: s.cameras_offline,
    activeAlerts: s.active_alerts,
    peopleDetected: s.people_detected_today,
    securityEvents: s.security_events_7d,
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const stats = await apiFetch<DashboardStatsResponse>(
    `/dashboard/summary${toQueryString({  })}`,
  )
  return toDashboardStats(stats)
}
