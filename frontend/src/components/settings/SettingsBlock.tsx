import type { ReactNode } from 'react'

interface SettingsBlockProps {
  title: string
  description: string
  children: ReactNode
}

export function SettingsBlock({ title, description, children }: SettingsBlockProps) {
  return (
    <div className="mb-4 rounded-lg border border-border bg-surface-1 p-[22px_24px]">
      <h3 className="text-[14px] font-semibold">{title}</h3>
      <p className="mb-[18px] mt-[3px] text-[12.5px] text-ink-muted">{description}</p>
      {children}
    </div>
  )
}

interface SettingsRowProps {
  label: string
  description: string
  children: ReactNode
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-[13px] first:border-t-0 first:pt-0">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{description}</div>
      </div>
      {children}
    </div>
  )
}
