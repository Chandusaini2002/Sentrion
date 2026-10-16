export type SettingsSection = 'account' | 'security' | 'camera' | 'notifications' | 'privacy'

const sections: { key: SettingsSection; label: string }[] = [
  { key: 'account', label: 'Account' },
  { key: 'security', label: 'Security' },
  { key: 'camera', label: 'Camera' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'privacy', label: 'Privacy' },
]

interface SettingsNavProps {
  active: SettingsSection
  onChange: (section: SettingsSection) => void
}

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <div className="sticky top-[92px] flex flex-row gap-0.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
      {sections.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`whitespace-nowrap rounded-sm px-3 py-[9px] text-left text-[13px] font-medium ${
            active === s.key ? 'bg-accent-dim text-accent-text' : 'text-ink-secondary hover:bg-surface-2'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
