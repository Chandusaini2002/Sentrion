import type { SecurityEvent, AlertSeverity, AlertStatus } from '@/types'
import { Badge, type BadgeTone } from '@/components/common/Badge'
import { formatClockTime } from '@/lib/format'

const severityTone: Record<AlertSeverity, BadgeTone> = {
  low: 'green',
  medium: 'orange',
  high: 'orange',
  critical: 'red',
}
const severityLabel: Record<AlertSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}
const statusTone: Record<AlertStatus, BadgeTone> = {
  resolved: 'green',
  unresolved: 'gray',
}
const statusLabel: Record<AlertStatus, string> = {
  resolved: 'Resolved',
  unresolved: 'Unresolved',
}

interface RecentEventsTableProps {
  events: SecurityEvent[]
}

export function RecentEventsTable({ events }: RecentEventsTableProps) {
  return (
    <div className="overflow-hidden overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            {['Time', 'Camera', 'Event type', 'Detection', 'Severity', 'Status'].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b border-border px-[18px] py-3 text-left text-[11.5px] font-medium text-ink-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-surface-2">
              <td className="border-b border-border px-[18px] py-[13px] font-mono text-[12.5px] text-ink-secondary">
                {formatClockTime(event.timestamp)}
              </td>
              <td className="border-b border-border px-[18px] py-[13px] text-[13px] font-medium">
                {event.cameraName}
              </td>
              <td className="border-b border-border px-[18px] py-[13px] text-[13px]">{event.eventType}</td>
              <td className="border-b border-border px-[18px] py-[13px] text-[12.5px] text-ink-muted">
                {event.detectionResult}
              </td>
              <td className="border-b border-border px-[18px] py-[13px]">
                <Badge tone={severityTone[event.severity]}>{severityLabel[event.severity]}</Badge>
              </td>
              <td className="border-b border-border px-[18px] py-[13px]">
                <Badge tone={statusTone[event.status]} withDot={false}>
                  {statusLabel[event.status]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
