import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  /** Usually an ApiError.message (see src/services/api.ts) — already a plain, user-safe string, never a raw stack trace. */
  message: string
  onRetry?: () => void
}

/**
 * Consistent "something went wrong" panel for API-backed pages —
 * network failures, backend-unavailable, and non-2xx responses all
 * surface through this. Visually mirrors EmptyState (same dashed-border
 * card) but in the danger palette, so it reads as an error rather than
 * "no data yet".
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-danger/40 bg-surface-1 px-6 py-14 text-center">
      <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-danger/30 bg-danger-dim text-danger-text">
        <AlertCircle size={20} />
      </div>
      <h3 className="mb-1.5 text-[14.5px] font-semibold">Something went wrong</h3>
      <p className="mb-4 max-w-[360px] text-[13px] text-ink-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-border-strong bg-surface-2 px-4 text-[13px] font-medium hover:bg-surface-hover"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  )
}
