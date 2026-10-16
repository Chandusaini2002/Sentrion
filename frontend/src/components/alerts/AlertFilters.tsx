import type { AlertFilter } from '@/types'

const filters: { key: AlertFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'unresolved', label: 'Unresolved' },
]

interface AlertFiltersProps {
  active: AlertFilter
  onChange: (filter: AlertFilter) => void
}

export function AlertFilters({ active, onChange }: AlertFiltersProps) {
  return (
    <div className="mb-[18px] flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors ${
            active === f.key
              ? 'border-accent/40 bg-accent-dim text-accent-text'
              : 'border-border bg-surface-1 text-ink-secondary hover:border-border-strong hover:text-ink-primary'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
