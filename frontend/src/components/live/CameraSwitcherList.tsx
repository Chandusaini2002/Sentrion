import { Video, WifiOff } from 'lucide-react'
import type { Camera } from '@/types'

interface CameraSwitcherListProps {
  cameras: Camera[]
  activeCameraId: string
  onSelect: (id: string) => void
}

export function CameraSwitcherList({ cameras, activeCameraId, onSelect }: CameraSwitcherListProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-border px-[18px] py-3.5">
      {cameras.map((camera) => {
        const isActive = camera.id === activeCameraId
        const online = camera.status === 'online'
        return (
          <button
            key={camera.id}
            onClick={() => onSelect(camera.id)}
            className="w-24 flex-shrink-0 text-left"
          >
            <div
              className={`relative mb-1.5 flex h-[60px] w-24 items-center justify-center rounded-md border-[1.5px] bg-[#0D1218] ${
                isActive ? 'border-accent' : 'border-border'
              }`}
            >
              {online ? (
                <Video size={18} strokeWidth={1.5} className="text-border-strong" />
              ) : (
                <WifiOff size={18} strokeWidth={1.5} className="text-ink-muted" />
              )}
              <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${online ? 'bg-success' : 'bg-ink-muted'}`} />
            </div>
            <span className="block truncate text-[11px] text-ink-secondary">{camera.name}</span>
          </button>
        )
      })}
    </div>
  )
}
