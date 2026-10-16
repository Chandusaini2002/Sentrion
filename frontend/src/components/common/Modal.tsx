import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-[560px]' }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/65 px-5 py-12 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`w-full ${maxWidth} rounded-lg border border-border-strong bg-surface-1 shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-sm border border-border text-ink-muted hover:text-ink-primary"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-[22px]">{children}</div>
        {footer && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
