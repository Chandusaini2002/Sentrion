import { useAlerts } from '@/hooks/useAlerts'
import { AlertFilters } from '@/components/alerts/AlertFilters'
import { AlertsTable } from '@/components/alerts/AlertsTable'
import { ErrorState } from '@/components/common/ErrorState'

export function AlertsPage() {
  const { alerts, loading, error, filter, setFilter, resolve, refetch, readOnly } = useAlerts()

  return (
    <div>
      {readOnly && (
        <p className="mb-3 text-[11.5px] text-ink-muted">Security alerts refresh automatically.</p>
      )}
      <AlertFilters active={filter} onChange={setFilter} />
      {loading ? (
        <p className="py-16 text-center text-[13px] text-ink-muted">Loading alerts…</p>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <AlertsTable alerts={alerts} onResolve={resolve} readOnly={readOnly} />
      )}
    </div>
  )
}
