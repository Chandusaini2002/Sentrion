import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Menu, Search } from 'lucide-react'
import { NotificationsDropdown } from './NotificationsDropdown'
import { StatusPill } from '@/components/common/StatusPill'
import type { User } from '@/types'

interface TopbarProps {
  title: string
  user: User | null
  onMenuClick: () => void
}

export function Topbar({ title, user, onMenuClick }: TopbarProps) {
  const { user: account } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-[18px] border-b border-border bg-surface-1/85 px-4 backdrop-blur-md md:px-[26px]">
      <button
        aria-label="Open menu"
        onClick={onMenuClick}
        className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-sm border border-border text-ink-secondary md:hidden"
      >
        <Menu size={17} />
      </button>

      <h1 className="whitespace-nowrap text-[15px] font-semibold md:text-[17px]">{title}</h1>

      <div className="hidden h-9 max-w-[360px] flex-1 items-center gap-2 rounded-sm border border-border bg-surface-2 px-3 text-ink-muted sm:flex">
        <Search size={15} className="flex-shrink-0" />
        <input
          type="text"
          placeholder="Search cameras, alerts, activity"
          className="w-full bg-transparent text-[13px] text-ink-primary outline-none placeholder:text-ink-muted"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {account ? <StatusPill label="Your workspace" tone="green" className="hidden sm:inline-flex" /> : <><Link to="/login" className="text-sm text-accent-text">Sign in</Link><Link to="/signup" className="text-sm text-accent-text">Sign up</Link></>}
        <NotificationsDropdown />
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-3 text-[12px] font-semibold text-ink-secondary">
          {user?.avatarInitials ?? '—'}
        </div>
      </div>
    </header>
  )
}
