import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  UserRound,
  Video,
  Radio,
  ShieldAlert,
  Activity,
  Settings,
} from 'lucide-react'

export interface NavEntry {
  to: string
  label: string
  icon: LucideIcon
  badgeKey?: 'alerts'
}

export const visitorNavEntries: NavEntry[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cameras', label: 'Cameras', icon: Video },
  { to: '/live', label: 'Live Monitoring', icon: Radio },
  { to: '/alerts', label: 'Security Alerts', icon: ShieldAlert, badgeKey: 'alerts' },
]

export const accountNavEntries: NavEntry[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: UserRound },
  { to: '/cameras', label: 'Cameras', icon: Video },
  { to: '/live', label: 'Live Monitoring', icon: Radio },
  { to: '/alerts', label: 'Security Alerts', icon: ShieldAlert, badgeKey: 'alerts' },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
]

// Backward-compatible export for any future component importing navEntries directly.
export const navEntries = accountNavEntries
