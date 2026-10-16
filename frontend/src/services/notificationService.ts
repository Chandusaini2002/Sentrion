import type { AppNotification, NotificationSeverity } from '@/types'
import { apiFetch, toQueryString } from './api'

interface NotificationResponse {
  id: string
  owner_id: string
  title: string
  message: string
  severity: NotificationSeverity | null
  is_read: boolean
  created_at: string
}

function toNotification(n: NotificationResponse): AppNotification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    timestamp: n.created_at,
    read: n.is_read,
    severity: n.severity ?? undefined,
  }
}

export async function getNotifications(): Promise<AppNotification[]> {
  const notifications = await apiFetch<NotificationResponse[]>(
    `/notifications${toQueryString({  })}`,
  )
  return notifications.map(toNotification)
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch<NotificationResponse>(`/notifications/${id}/read`, { method: 'PATCH' })
}
