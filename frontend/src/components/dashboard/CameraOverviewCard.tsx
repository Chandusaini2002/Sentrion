import { useNavigate } from 'react-router-dom'
import { MapPin, UsersRound, Video } from 'lucide-react'
import type { Camera } from '@/types'
import { formatRelativeTime } from '@/lib/format'
import { Button } from '@/components/common/Button'

interface CameraOverviewCardProps {
  camera: Camera
}

export function CameraOverviewCard({ camera }: CameraOverviewCardProps) {
  const isOnline = camera.status === 'online'
  const navigate = useNavigate()
  const hasPreview = Boolean(camera.streamUrl)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
      <div
        className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-[repeating-linear-gradient(0deg,#0D1319_0px,#0D1319_2px,#0F151C_2px,#0F151C_4px)] ${
          isOnline ? '' : 'opacity-[0.72]'
        }`}
      >
        {hasPreview ? (
          <video
            key={`${camera.id}-${camera.streamUrl}`}
            src={camera.streamUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            aria-label={`${camera.name} demo camera footage`}
          />
        ) : (
          <Video size={34} className="text-border-strong" strokeWidth={1.5} />
        )}

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-inactive'}`} />
          {isOnline ? 'Live demo' : 'Offline · last footage'}
        </div>

        {isOnline && camera.peopleDetected !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-sm">
            <UsersRound size={12} />
            {camera.peopleDetected} detected
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-0.5 text-[13.5px] font-semibold">{camera.name}</div>
        <div className="mb-3 flex items-center gap-1.5 text-[12px] text-ink-muted">
          <MapPin size={12} className="flex-shrink-0" />
          {camera.location}
        </div>
        <div className="mb-3 flex items-center justify-between border-t border-border pt-2.5 text-[11.5px] text-ink-muted">
          <span className="font-mono text-ink-secondary">{camera.address}</span>
          <span>
            {isOnline
              ? `Active ${formatRelativeTime(camera.lastActivity ?? camera.lastConnection)}`
              : `Last seen ${formatRelativeTime(camera.lastConnection)}`}
          </span>
        </div>
        <Button size="sm" className="w-full" onClick={() => navigate(`/live/${camera.id}`)}>
          View camera
        </Button>
      </div>
    </div>
  )
}
