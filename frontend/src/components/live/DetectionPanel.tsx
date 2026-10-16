import { ScanFace, AlertTriangle } from 'lucide-react'
import type { DetectionSnapshot } from '@/types'
import { ProgressBar } from '@/components/common/ProgressBar'
import { formatClockTime } from '@/lib/format'

const eventDot: Record<string, string> = {
  critical: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-success',
}

interface DetectionPanelProps {
  snapshot: DetectionSnapshot | null
  loading: boolean
}

export function DetectionPanel({ snapshot, loading }: DetectionPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-[18px]">
      <h3 className="mb-3.5 flex items-center gap-1.5 text-[13px] font-semibold">
        <ScanFace size={15} className="text-accent-text" />
        AI detection panel
      </h3>

      {loading || !snapshot ? (
        <p className="py-8 text-center text-[12.5px] text-ink-muted">Loading detections…</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-sm border border-border bg-surface-2 p-3">
              <div className="font-mono text-[20px] font-semibold">{snapshot.peopleDetected}</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">People detected</div>
            </div>
            <div className="rounded-sm border border-border bg-surface-2 p-3">
              <div className="font-mono text-[20px] font-semibold">{snapshot.faceDetections}</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">Face detections</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-[12px] text-ink-secondary">
              <span>Detection confidence</span>
              <span className="font-mono text-accent-text">{snapshot.detectionConfidence}%</span>
            </div>
            <ProgressBar value={snapshot.detectionConfidence} />
          </div>

          {snapshot.unknownPersonDetected && (
            <div className="mb-4 flex items-start gap-2.5 rounded-sm border border-caution/30 bg-caution-dim px-3 py-2.5">
              <AlertTriangle size={15} className="mt-px flex-shrink-0 text-caution-text" />
              <div>
                <div className="text-[12px] font-medium text-caution-text">Unknown person detected</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  Not matched to any recognized profile
                </div>
              </div>
            </div>
          )}

          {snapshot.recognizedProfiles.length > 0 && (
            <div className="mb-4">
              <div className="mb-1.5 text-[12px] font-medium text-ink-muted">Recognized profiles</div>
              {snapshot.recognizedProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-2.5 border-t border-border py-2 first:border-t-0">
                  <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-3 text-[10px] font-semibold text-ink-secondary">
                    {profile.initials}
                  </div>
                  <div>
                    <div className="text-[12.5px] font-medium">{profile.name}</div>
                    <div className="text-[11px] text-ink-muted">
                      Matched at {formatClockTime(profile.matchedAt)} · {profile.confidence}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-2 text-[12px] font-medium text-ink-muted">Recent events</div>
          <div>
            {snapshot.recentEvents.map((event) => (
              <div key={event.id} className="flex gap-2.5 border-t border-border py-2.5 first:border-t-0">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${eventDot[event.severity]}`} />
                <div>
                  <div className="text-[12px] text-ink-secondary">{event.label}</div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-ink-muted">
                    {formatClockTime(event.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
