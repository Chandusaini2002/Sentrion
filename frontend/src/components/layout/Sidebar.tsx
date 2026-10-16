import { useAuth } from '@/auth/useAuth'
import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { ShieldCheck, LogOut } from 'lucide-react'
import type { NavEntry } from './navConfig'
import type { User } from '@/types'

interface SidebarProps {
  user: User | null
  entries: NavEntry[]
  unresolvedAlertCount: number
  mobileOpen: boolean
  onNavigate: () => void
}

export function Sidebar({ user, entries, unresolvedAlertCount, mobileOpen, onNavigate }: SidebarProps) {
  const { user: account, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-border bg-surface-1 transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-border px-[22px]">
        <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[7px] border border-border-strong bg-accent-dim">
          <ShieldCheck size={14} className="text-accent-text" />
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-[0.2px]">Sentrion</div>
          <div className="font-mono text-[10px] tracking-[0.3px] text-ink-muted">SECURITY PLATFORM</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {entries.map((entry) => {
          const Icon = entry.icon
          const badgeCount = entry.badgeKey === 'alerts' ? unresolvedAlertCount : undefined
          return (
            <NavLink
              key={entry.to}
              to={entry.to}
              end={entry.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-[11px] rounded-sm border px-3 py-[9px] text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'border-accent/35 bg-accent-dim text-accent-text'
                    : 'border-transparent text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="truncate">{entry.label}</span>
              {!!badgeCount && (
                <span className="ml-auto rounded-full bg-danger-dim px-1.5 py-0.5 font-mono text-[10.5px] text-danger-text">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-border p-3.5">
        <div className="flex items-center gap-2.5 rounded-sm p-2 hover:bg-surface-hover">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-3 text-[12px] font-semibold text-ink-secondary">
            {user?.avatarInitials ?? '—'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{account ? user?.fullName : 'Visitor'}</div>
            <div className={`mt-px flex items-center gap-1.5 text-[11px] ${account ? 'text-success-text' : 'text-ink-muted'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${account ? 'bg-current' : 'bg-accent'}`} />
              {account ? 'Account active' : 'Unsigned access'}
            </div>
          </div>
          {account && (
            <button
              onClick={() => { logout(); navigate('/', { replace: true }) }}
              aria-label="Log out"
              title="Log out"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-border text-ink-muted hover:border-danger/40 hover:text-danger-text"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
