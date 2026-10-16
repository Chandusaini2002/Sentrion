interface ProgressBarProps {
  value: number
  max?: number
}

export function ProgressBar({ value, max = 100 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="h-1.5 overflow-hidden rounded-full border border-border bg-surface-3">
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  )
}
