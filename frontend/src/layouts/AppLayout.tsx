import { visitorUser } from '@/services/visitorIdentityService'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { accountNavEntries, visitorNavEntries } from '@/components/layout/navConfig'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAlerts } from '@/hooks/useAlerts'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user } = useCurrentUser()
  const { allAlerts } = useAlerts()
  const location = useLocation()
  const entries = user ? accountNavEntries : visitorNavEntries

  const unresolvedAlertCount = allAlerts.filter((a) => a.status === 'unresolved').length
  const activeEntry = entries.find((e) =>
    e.to === '/' ? location.pathname === '/' : location.pathname.startsWith(e.to),
  )

  return (
    <div className="flex min-h-screen">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[39] bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        user={user ?? visitorUser}
        entries={entries}
        unresolvedAlertCount={unresolvedAlertCount}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col md:ml-[248px]">
        <Topbar
          title={activeEntry?.label ?? 'Dashboard'}
          user={user ?? visitorUser}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="w-full max-w-[1400px] px-4 pb-16 pt-7 sm:px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
