import { ProgressBar } from '@/components/common/ProgressBar'

interface ProfileCompletionProps {
  value: number
  hint?: string
}

export function ProfileCompletion({ value, hint }: ProfileCompletionProps) {
  return (
    <div className="min-w-[220px] flex-1">
      <div className="mb-[7px] flex justify-between text-[12.5px]">
        <span>Profile completion</span>
        <span className="font-mono font-medium text-accent-text">{value}%</span>
      </div>
      <ProgressBar value={value} />
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  )
}
