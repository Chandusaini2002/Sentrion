export type StatusTone = 'green' | 'yellow' | 'orange' | 'red' | 'gray'

const toneClasses: Record<StatusTone, string> = {
  green: 'bg-success-dim border-success/30 text-success-text',
  yellow: 'bg-warning-dim border-warning/30 text-warning-text',
  orange: 'bg-caution-dim border-caution/30 text-caution-text',
  red: 'bg-danger-dim border-danger/30 text-danger-text',
  gray: 'bg-inactive-dim border-border text-inactive-text',
}

const dotClasses: Record<StatusTone, string> = {
  green: 'bg-success shadow-[0_0_0_3px_rgba(76,174,128,0.18)]',
  yellow: 'bg-warning',
  orange: 'bg-caution',
  red: 'bg-danger',
  gray: 'bg-inactive',
}

interface StatusPillProps {
  label: string
  tone: StatusTone
  className?: string
}

export function StatusPill({ label, tone, className = '' }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-medium ${toneClasses[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {label}
    </span>
  )
}
