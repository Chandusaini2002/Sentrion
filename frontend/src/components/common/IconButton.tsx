import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  danger?: boolean
  label: string
}

export function IconButton({ icon, danger, label, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-sm border border-border text-ink-muted transition-colors hover:border-border-strong hover:bg-surface-3 hover:text-ink-primary ${
        danger ? 'hover:border-danger/40 hover:text-danger-text' : ''
      } ${className}`}
      {...rest}
    >
      {icon}
    </button>
  )
}
