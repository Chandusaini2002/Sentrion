import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { useAuth } from '@/auth/useAuth'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { CamerasPage } from '@/pages/CamerasPage'
import { LiveMonitoringPage } from '@/pages/LiveMonitoringPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { ActivityPage } from '@/pages/ActivityPage'

function Protected() {
  return useAuth().user ? <Outlet /> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, loading, error, refetch, logout } = useAuth()

  if (loading) return <p className="p-12 text-center">Restoring session…</p>
  if (error) {
    return (
      <div className="p-12 text-center">
        <p role="alert">{error}</p>
        <button className="m-4 underline" onClick={() => void refetch()}>Retry</button>
        <button onClick={logout}>Continue as visitor</button>
      </div>
    )
  }

  return (
    <Routes key={user?.id ?? 'visitor'}>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage signup />} />

      <Route element={<AppLayout />}>
        {/* Visitor-accessible security views. */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <DashboardPage />} />
        <Route path="/cameras" element={<CamerasPage />} />
        <Route path="/live" element={<LiveMonitoringPage />} />
        <Route path="/live/:cameraId" element={<LiveMonitoringPage />} />
        <Route path="/alerts" element={<AlertsPage />} />

        {/* Account-only workspace pages. */}
        <Route element={<Protected />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route
            path="/settings"
            element={<p className="text-ink-secondary">Account settings are coming soon. You can update your profile from My Profile.</p>}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
