import type { ReactNode } from 'react'

export type BadgeTone = 'green' | 'yellow' | 'orange' | 'red' | 'gray'

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-success-dim text-success-text border-success/30',
  yellow: 'bg-warning-dim text-warning-text border-warning/30',
  orange: 'bg-caution-dim text-caution-text border-caution/30',
  red: 'bg-danger-dim text-danger-text border-danger/30',
  gray: 'bg-inactive-dim text-inactive-text border-border',
}

const dotClasses: Record<BadgeTone, string> = {
  green: 'bg-success',
  yellow: 'bg-warning',
  orange: 'bg-caution',
  red: 'bg-danger',
  gray: 'bg-inactive',
}

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
  withDot?: boolean
}

export function Badge({ tone, children, withDot = true }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${toneClasses[tone]}`}
    >
      {withDot && <span className={`h-[5px] w-[5px] rounded-full ${dotClasses[tone]}`} />}
      {children}
    </span>
  )
}
