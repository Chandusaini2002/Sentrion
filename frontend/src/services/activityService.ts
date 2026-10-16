import type { ActivityLogEntry, ActivityType } from '@/types'
import { apiFetch, toQueryString } from './api'

interface ActivityLogEntryResponse {
  id: string
  owner_id: string
  camera_id: string | null
  type: ActivityType
  title: string
  description: string
  occurred_at: string
  created_at: string
}

function toActivityEntry(e: ActivityLogEntryResponse): ActivityLogEntry {
  return {
    id: e.id,
    type: e.type,
    title: e.title,
    description: e.description,
    timestamp: e.occurred_at,
    cameraId: e.camera_id,
  }
}

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  const entries = await apiFetch<ActivityLogEntryResponse[]>(
    `/activity${toQueryString({  })}`,
  )
  return entries.map(toActivityEntry)
}
