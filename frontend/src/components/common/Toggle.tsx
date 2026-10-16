interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[38px] flex-shrink-0 rounded-full border transition-colors ${
        checked ? 'border-accent bg-accent-dim' : 'border-border-strong bg-surface-3'
      }`}
    >
      <span
        className={`absolute top-[2px] h-4 w-4 rounded-full transition-transform ${
          checked ? 'translate-x-4 bg-accent-text' : 'translate-x-[2px] bg-ink-muted'
        }`}
      />
    </button>
  )
}
