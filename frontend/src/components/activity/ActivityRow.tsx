import type { LucideIcon } from 'lucide-react'
import {
  ShieldAlert,
  WifiOff,
  Wifi,
  UsersRound,
  ScanFace,
  UserRound,
  Settings,
  Video,
} from 'lucide-react'
import type { ActivityLogEntry, ActivityType } from '@/types'
import { formatDateTime } from '@/lib/format'

const iconByType: Record<ActivityType, LucideIcon> = {
  camera_connected: Wifi,
  camera_disconnected: WifiOff,
  person_detected: UsersRound,
  face_matched: ScanFace,
  unknown_person_detected: ShieldAlert,
  profile_updated: UserRound,
  camera_settings_changed: Settings,
  security_alert_generated: Video,
}

interface ActivityRowProps {
  entry: ActivityLogEntry
}

export function ActivityRow({ entry }: ActivityRowProps) {
  const Icon = iconByType[entry.type]
  return (
    <div className="flex items-start gap-3.5 border-b border-border px-5 py-3.5 last:border-b-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-3">
        <Icon size={15} className="text-ink-secondary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium">{entry.title}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{entry.description}</div>
      </div>
      <div className="whitespace-nowrap pt-0.5 font-mono text-[11.5px] text-ink-muted">
        {formatDateTime(entry.timestamp)}
      </div>
    </div>
  )
}
