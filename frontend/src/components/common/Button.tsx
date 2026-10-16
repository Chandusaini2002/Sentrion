import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'primary' | 'danger' | 'ghost'
type Size = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface-2 border border-border-strong text-ink-primary hover:bg-surface-hover',
  primary: 'bg-accent border border-accent text-[#08161B] font-semibold hover:bg-accent-strong hover:border-accent-strong',
  danger: 'bg-transparent border border-danger/40 text-danger-text hover:bg-danger-dim',
  ghost: 'bg-transparent border border-transparent text-ink-primary hover:bg-surface-hover',
}

const sizeClasses: Record<Size, string> = {
  md: 'h-9 px-4 text-[13px]',
  sm: 'h-[30px] px-3 text-[12.5px]',
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
