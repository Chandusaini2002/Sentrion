import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label: string
  hint?: string
  full?: boolean
  children: ReactNode
}

export function FieldWrapper({ label, hint, full, children }: FieldWrapperProps) {
  return (
    <div className={`mb-4 ${full ? 'col-span-2' : ''}`}>
      <label className="mb-[7px] block text-[12.5px] font-medium text-ink-secondary">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  full?: boolean
}

export function TextField({ label, hint, full, className = '', ...rest }: TextFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint} full={full}>
      <input
        aria-label={label}
        className={`h-[38px] w-full rounded-sm border border-border bg-surface-2 px-3 text-[13px] text-ink-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim ${className}`}
        {...rest}
      />
    </FieldWrapper>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  hint?: string
  full?: boolean
  children: ReactNode
}

export function SelectField({ label, hint, full, children, className = '', ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint} full={full}>
      <select
        aria-label={label}
        className={`h-[38px] w-full appearance-none rounded-sm border border-border bg-surface-2 px-3 text-[13px] text-ink-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
