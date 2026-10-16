import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
  linkLabel?: string
  linkTo?: string
  action?: ReactNode
}

export function SectionHeader({ title, linkLabel, linkTo, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {linkLabel && linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-[12.5px] font-medium text-accent-text hover:underline"
        >
          {linkLabel}
          <ArrowRight size={13} />
        </Link>
      )}
      {action}
    </div>
  )
}
