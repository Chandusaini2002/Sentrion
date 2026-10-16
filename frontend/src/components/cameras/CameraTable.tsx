import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import type { Camera } from '@/types'
import { Badge } from '@/components/common/Badge'
import { IconButton } from '@/components/common/IconButton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatRelativeTime } from '@/lib/format'
import { testSavedCameraConnection } from '@/services/cameraService'

interface CameraTableProps {
  cameras: Camera[]
  onDelete: (id: string) => Promise<void>
  onRefresh?: () => Promise<unknown> | void
  visitorMode?: boolean
}

export function CameraTable({ cameras, onDelete, onRefresh, visitorMode = false }: CameraTableProps) {
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] = useState<Camera | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState(false)

  async function handleTest(camera: Camera) {
    setTestingId(camera.id)
    setTestMessage(null)
    try {
      const result = await testSavedCameraConnection(camera.id)
      setTestSuccess(result.success)
      setTestMessage(`${camera.name}: ${result.message}`)
      await onRefresh?.()
    } catch (e) {
      setTestSuccess(false)
      setTestMessage(`${camera.name}: ${e instanceof Error ? e.message : 'Connection test failed.'}`)
    } finally {
      setTestingId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    await onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      {testMessage && (
        <div
          className={`mb-3 rounded-sm border px-3 py-2 text-[12px] ${
            testSuccess
              ? 'border-success/30 bg-success-dim text-success-text'
              : 'border-danger/30 bg-danger-dim text-danger-text'
          }`}
        >
          {testMessage}
        </div>
      )}

      <div className="overflow-hidden overflow-x-auto rounded-lg border border-border bg-surface-1">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              {['Camera', 'Location', 'Address', 'Status', 'Last connection', ''].map((h) => (
                <th key={h} className="whitespace-nowrap border-b border-border px-[18px] py-3 text-left text-[11.5px] font-medium text-ink-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera) => (
              <tr key={camera.id} className="hover:bg-surface-2">
                <td className="border-b border-border px-[18px] py-[13px] text-[13px] font-medium">
                  <div className="flex items-center gap-2">
                    <span>{camera.name}</span>
                    {camera.isTemporary && <Badge tone="gray" withDot={false}>Temporary</Badge>}
                  </div>
                </td>
                <td className="border-b border-border px-[18px] py-[13px] text-[12.5px] text-ink-muted">{camera.location}</td>
                <td className="border-b border-border px-[18px] py-[13px] font-mono text-[12.5px] text-ink-secondary">{camera.address}</td>
                <td className="border-b border-border px-[18px] py-[13px]">
                  <Badge tone={camera.status === 'online' ? 'green' : 'gray'}>
                    {camera.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </td>
                <td className="border-b border-border px-[18px] py-[13px] text-[12.5px] text-ink-muted">{formatRelativeTime(camera.lastConnection)}</td>
                <td className="border-b border-border px-[18px] py-[13px]">
                  <div className="flex justify-end gap-1.5">
                    <IconButton label="View camera" icon={<Eye size={14} />} onClick={() => navigate(`/live/${camera.id}`)} />
                    {!visitorMode && (
                      <>
                        <IconButton label="Edit camera" icon={<Pencil size={14} />} />
                        <IconButton
                          label="Test connection"
                          icon={<RefreshCw size={14} className={testingId === camera.id ? 'animate-spin' : ''} />}
                          onClick={() => handleTest(camera)}
                          disabled={testingId === camera.id}
                        />
                        <IconButton label="Delete camera" icon={<Trash2 size={14} />} danger onClick={() => setPendingDelete(camera)} />
                      </>
                    )}
                    {visitorMode && camera.isTemporary && (
                      <IconButton label="Remove temporary camera" icon={<Trash2 size={14} />} danger onClick={() => setPendingDelete(camera)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={pendingDelete?.isTemporary ? 'Remove temporary camera' : 'Delete camera'}
        description={
          pendingDelete?.isTemporary ? (
            <>Remove <b className="text-ink-primary">{pendingDelete?.name}</b> from this browser session?</>
          ) : (
            <>Are you sure you want to delete <b className="text-ink-primary">{pendingDelete?.name}</b>? This removes its connection details and stops monitoring.</>
          )
        }
        confirmLabel={pendingDelete?.isTemporary ? 'Remove camera' : 'Delete camera'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
