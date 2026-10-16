import { Video, CheckCircle2, XCircle, ShieldAlert, UsersRound, Activity } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StatCard } from '@/components/dashboard/StatCard'
import { CameraOverviewCard } from '@/components/dashboard/CameraOverviewCard'
import { RecentEventsTable } from '@/components/dashboard/RecentEventsTable'
import { SectionHeader } from '@/components/common/SectionHeader'
import { ErrorState } from '@/components/common/ErrorState'

export function DashboardPage() {
  const { stats, cameras, events, loading, error, refetch } = useDashboardStats()

  if (loading) {
    return <p className="py-16 text-center text-[13px] text-ink-muted">Loading dashboard…</p>
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Video} value={stats.totalCameras} label="Total cameras" />
        <StatCard
          icon={CheckCircle2}
          iconClassName="text-success"
          value={stats.camerasOnline}
          label="Cameras online"
        />
        <StatCard
          icon={XCircle}
          iconClassName="text-inactive-text"
          value={stats.camerasOffline}
          label="Cameras offline"
        />
        <StatCard
          icon={ShieldAlert}
          iconClassName="text-danger"
          value={stats.activeAlerts}
          label="Active alerts"
        />
        <StatCard icon={UsersRound} value={stats.peopleDetected} label="People detected today" />
        <StatCard icon={Activity} value={stats.securityEvents} label="Security events (7d)" />
      </div>

      <SectionHeader title="Live camera overview" linkLabel="View all cameras" linkTo="/cameras" />
      {cameras.length === 0 ? (
        <p className="mb-8 rounded-lg border border-dashed border-border-strong bg-surface-1 py-10 text-center text-[13px] text-ink-muted">
          No cameras added yet. Add your first camera to start monitoring.
        </p>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cameras.map((camera) => (
            <CameraOverviewCard key={camera.id} camera={camera} />
          ))}
        </div>
      )}

      <SectionHeader title="Recent security events" linkLabel="View all alerts" linkTo="/alerts" />
      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong bg-surface-1 py-10 text-center text-[13px] text-ink-muted">
          No security events recorded yet.
        </p>
      ) : (
        <RecentEventsTable events={events} />
      )}
    </div>
  )
}
