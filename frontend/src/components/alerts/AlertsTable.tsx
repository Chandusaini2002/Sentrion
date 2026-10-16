import { Check } from 'lucide-react'
import type { SecurityAlert, AlertSeverity, AlertStatus } from '@/types'
import { Badge, type BadgeTone } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { IconButton } from '@/components/common/IconButton'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDateTime } from '@/lib/format'
import { ShieldAlert } from 'lucide-react'

const severityTone: Record<AlertSeverity, BadgeTone> = { low: 'green', medium: 'orange', high: 'orange', critical: 'red' }
const severityLabel: Record<AlertSeverity, string> = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
const statusTone: Record<AlertStatus, BadgeTone> = { resolved: 'green', unresolved: 'gray' }

interface AlertsTableProps {
  alerts: SecurityAlert[]
  onResolve: (id: string) => void
  readOnly?: boolean
}

export function AlertsTable({ alerts, onResolve, readOnly = false }: AlertsTableProps) {
  if (alerts.length === 0) {
    return <EmptyState icon={<ShieldAlert size={22} />} title="No alerts match this filter" description="Try a different severity or status filter to see more security alerts." />
  }

  return (
    <div className="overflow-hidden overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr>
            {['Alert type', 'Camera', 'Date / time', 'Detection', 'Severity', 'Status', ...(readOnly ? [] : [''])].map((h, i) => (
              <th key={`${h}-${i}`} className="whitespace-nowrap border-b border-border px-[18px] py-3 text-left text-[11.5px] font-medium text-ink-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-surface-2">
              <td className="border-b border-border px-[18px] py-[13px] text-[13px] font-medium">{alert.type}</td>
              <td className="border-b border-border px-[18px] py-[13px] text-[13px]">{alert.cameraName}</td>
              <td className="border-b border-border px-[18px] py-[13px] font-mono text-[12.5px] text-ink-secondary">{formatDateTime(alert.timestamp)}</td>
              <td className="border-b border-border px-[18px] py-[13px] text-[12.5px] text-ink-muted">{alert.detectionInfo}</td>
              <td className="border-b border-border px-[18px] py-[13px]"><Badge tone={severityTone[alert.severity]}>{severityLabel[alert.severity]}</Badge></td>
              <td className="border-b border-border px-[18px] py-[13px]"><Badge tone={statusTone[alert.status]} withDot={false}>{alert.status === 'resolved' ? 'Resolved' : 'Unresolved'}</Badge></td>
              {!readOnly && (
                <td className="border-b border-border px-[18px] py-[13px]">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm">{alert.status === 'resolved' ? 'View' : 'Investigate'}</Button>
                    {alert.status === 'unresolved' && <IconButton label="Mark resolved" icon={<Check size={14} />} onClick={() => onResolve(alert.id)} />}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
