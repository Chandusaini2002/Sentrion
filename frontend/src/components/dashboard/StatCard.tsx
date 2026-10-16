import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  iconClassName?: string
  value: number | string
  label: string
}

export function StatCard({ icon: Icon, iconClassName = 'text-ink-secondary', value, label }: StatCardProps) {
  return (
    <div className="rounded border border-border bg-surface-1 p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-3">
          <Icon size={15} className={iconClassName} />
        </div>
      </div>
      <div className="font-mono text-[26px] font-semibold tracking-[-0.3px]">{value}</div>
      <div className="mt-1 text-[12px] text-ink-muted">{label}</div>
    </div>
  )
}
