import type { ActivityLogEntry } from '@/types'
import { ActivityRow } from './ActivityRow'
import { EmptyState } from '@/components/common/EmptyState'
import { Activity } from 'lucide-react'

interface ActivityListProps {
  entries: ActivityLogEntry[]
}

export function ActivityList({ entries }: ActivityListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Activity size={22} />}
        title="No activity yet"
        description="System and security events will appear here as they happen."
      />
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1">
      {entries.map((entry) => (
        <ActivityRow key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
