import { useEffect, useState, type ReactNode } from 'react'
import { ExternalLink, Loader2, RefreshCw, Video, WifiOff } from 'lucide-react'
import type { Camera, CameraStreamInfo } from '@/types'
import { getCameraStream } from '@/services/cameraService'
import { Button } from '@/components/common/Button'

export function LivePlayer({ camera, children }: { camera: Camera; children?: ReactNode }) {
  const [stream, setStream] = useState<CameraStreamInfo | null>(null)
  const [streamLoading, setStreamLoading] = useState(false)
  const [streamError, setStreamError] = useState('')
  const isVisitorMedia = Boolean(camera.streamUrl)

  async function loadRealStream() {
    if (isVisitorMedia || camera.status !== 'online') return
    setStreamLoading(true)
    setStreamError('')
    setStream(null)
    try {
      const info = await getCameraStream(camera.id)
      if (!info.available || !info.webrtcUrl) {
        setStreamError(info.message)
      } else {
        setStream(info)
      }
    } catch (e) {
      setStreamError(e instanceof Error ? e.message : 'Unable to prepare the live stream.')
    } finally {
      setStreamLoading(false)
    }
  }

  useEffect(() => {
    setStream(null)
    setStreamError('')
    if (!isVisitorMedia && camera.status === 'online') {
      void loadRealStream()
    }
    // camera.id is sufficient to refresh when the active camera changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.id, camera.status, isVisitorMedia])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="font-semibold">{camera.name}</p>
          <p className="text-xs text-ink-muted">
            {camera.location || 'No location'} · {camera.address || 'Configured'} · {camera.status}
          </p>
        </div>
        {camera.isTemporary && (
          <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10.5px] text-ink-muted">Temporary</span>
        )}
      </div>

      {isVisitorMedia && camera.status === 'online' ? (
        <div className="relative bg-black">
          <video
            key={camera.id}
            src={camera.streamUrl}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="aspect-video w-full bg-black object-cover"
          />
          <LiveBadge />
        </div>
      ) : camera.status === 'offline' ? (
        <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center text-ink-muted">
          <WifiOff size={52} />
          <div>
            <p className="text-[13px] font-medium text-ink-secondary">Camera is offline</p>
            <p className="mt-1 text-[11.5px]">Use Cameras → Test connection, then return here.</p>
          </div>
        </div>
      ) : streamLoading ? (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-black text-ink-secondary">
          <Loader2 size={32} className="animate-spin text-accent-text" />
          <p className="text-[12px]">Preparing MediaMTX WebRTC stream…</p>
        </div>
      ) : stream?.available && stream.webrtcUrl ? (
        <div className="relative aspect-video bg-black">
          <iframe
            key={`${camera.id}-${stream.pathName ?? 'stream'}`}
            title={`${camera.name} live stream`}
            src={stream.webrtcUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0 bg-black"
          />
          <LiveBadge />
          <a
            href={stream.webrtcUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm"
          >
            Open stream <ExternalLink size={10} />
          </a>
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center text-ink-muted">
          <Video size={52} />
          <div className="max-w-lg">
            <p className="text-[13px] font-medium text-ink-secondary">Live stream unavailable</p>
            <p className="mt-1 text-[11.5px]">
              {streamError || 'Sentrion could not prepare the MediaMTX stream.'}
            </p>
          </div>
          <Button size="sm" icon={<RefreshCw size={13} />} onClick={() => void loadRealStream()}>
            Retry stream
          </Button>
        </div>
      )}

      {children}
    </div>
  )
}

function LiveBadge() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-danger" /> LIVE
    </div>
  )
}
