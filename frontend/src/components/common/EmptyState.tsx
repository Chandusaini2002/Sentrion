import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-1 px-6 py-14 text-center">
      <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border bg-surface-3 text-ink-muted">
        {icon}
      </div>
      <h3 className="mb-1.5 text-[14.5px] font-semibold">{title}</h3>
      <p className="mb-4 max-w-[320px] text-[13px] text-ink-muted">{description}</p>
      {action}
    </div>
  )
}
