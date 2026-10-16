import { useActivity } from '@/hooks/useActivity'
import { ActivityList } from '@/components/activity/ActivityList'
import { ErrorState } from '@/components/common/ErrorState'

export function ActivityPage() {
  const { activity, loading, error, refetch } = useActivity()

  if (loading) {
    return <p className="py-16 text-center text-[13px] text-ink-muted">Loading activity…</p>
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return <ActivityList entries={activity} />
}
