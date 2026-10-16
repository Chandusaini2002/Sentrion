import { useMemo, useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw, Server, ShieldCheck, Video, XCircle } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { SelectField, TextField } from '@/components/common/FormField'
import type {
  CameraDeviceType,
  CameraDraft,
  ConnectionTestStatus,
  ConnectionType,
  NvrChannelProbe,
  NvrChannelSelection,
  StreamProfile,
} from '@/types'
import { scanNvrChannels, testCameraConnection } from '@/services/cameraService'
import { testTemporaryVisitorCamera } from '@/services/visitorService'

const emptyDraft: CameraDraft = {
  name: '',
  location: '',
  address: '',
  connectionType: 'rtsp',
  username: '',
  password: '',
  deviceType: 'cp_plus_nvr',
  rtspPort: 554,
  channel: 1,
  channelCount: 4,
  streamProfile: 'sub',
}

interface AddCameraModalProps {
  open: boolean
  onClose: () => void
  onSave: (draft: CameraDraft) => Promise<unknown>
  onSaveNvrChannels?: (draft: CameraDraft, channels: NvrChannelSelection[]) => Promise<unknown>
  visitorMode?: boolean
}

interface ChannelFormState {
  selected: boolean
  name: string
  location: string
}

export function AddCameraModal({
  open,
  onClose,
  onSave,
  onSaveNvrChannels,
  visitorMode = false,
}: AddCameraModalProps) {
  const [draft, setDraft] = useState<CameraDraft>(emptyDraft)
  const [testStatus, setTestStatus] = useState<ConnectionTestStatus>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [scanRows, setScanRows] = useState<NvrChannelProbe[]>([])
  const [channelForms, setChannelForms] = useState<Record<number, ChannelFormState>>({})

  const isNvrMode = !visitorMode && draft.deviceType === 'cp_plus_nvr'

  function clearTestState() {
    setTestStatus('idle')
    setTestMessage('')
    setScanRows([])
    setChannelForms({})
  }

  function update<K extends keyof CameraDraft>(key: K, value: CameraDraft[K]) {
    clearTestState()
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setDraft(emptyDraft)
    clearTestState()
    setSaving(false)
  }

  async function handleTestConnection() {
    setTestStatus('testing')
    setTestMessage('')
    try {
      if (visitorMode) {
        const result = await testTemporaryVisitorCamera()
        setTestStatus(result.success ? 'success' : 'error')
        setTestMessage(result.message)
        return
      }

      if (isNvrMode) {
        const result = await scanNvrChannels(draft)
        setScanRows(result.channels)

        const nextForms: Record<number, ChannelFormState> = {}
        result.channels.forEach((row) => {
          if (!row.success) return
          nextForms[row.channel] = {
            selected: true,
            name: `${draft.name.trim() || 'Camera'} CH${row.channel}`,
            location: draft.location.trim(),
          }
        })
        setChannelForms(nextForms)

        if (result.successfulChannels > 0) {
          setTestStatus('success')
          setTestMessage(
            `${result.successfulChannels} of ${result.channelCount} channel${result.channelCount === 1 ? '' : 's'} returned video. Select the cameras you want to register.`,
          )
        } else {
          setTestStatus('error')
          setTestMessage('The recorder was tested, but none of the requested channels returned video.')
        }
        return
      }

      const result = await testCameraConnection(draft)
      setTestStatus(result.success ? 'success' : 'error')
      setTestMessage(result.message)
    } catch (e) {
      setTestStatus('error')
      setTestMessage(e instanceof Error ? e.message : 'Unable to test camera connection.')
    }
  }

  const selectedChannels = useMemo<NvrChannelSelection[]>(() => {
    return scanRows
      .filter((row) => row.success && channelForms[row.channel]?.selected)
      .map((row) => ({
        channel: row.channel,
        name: channelForms[row.channel]?.name.trim() || `${draft.name.trim() || 'Camera'} CH${row.channel}`,
        location: channelForms[row.channel]?.location.trim() || '',
      }))
      .filter((channel) => channel.name.length > 0)
  }, [scanRows, channelForms, draft.name])

  async function handleSave() {
    setSaving(true)
    try {
      if (isNvrMode) {
        if (!onSaveNvrChannels) throw new Error('NVR channel saving is not available.')
        if (selectedChannels.length === 0) throw new Error('Select at least one working NVR channel.')
        await onSaveNvrChannels(draft, selectedChannels)
      } else {
        await onSave(draft)
      }
      reset()
      onClose()
    } catch (e) {
      setTestStatus('error')
      setTestMessage(e instanceof Error ? e.message : 'Unable to save camera.')
    } finally {
      setSaving(false)
    }
  }

  function updateChannel(channel: number, patch: Partial<ChannelFormState>) {
    setChannelForms((prev) => ({
      ...prev,
      [channel]: {
        selected: prev[channel]?.selected ?? false,
        name: prev[channel]?.name ?? '',
        location: prev[channel]?.location ?? '',
        ...patch,
      },
    }))
  }

  const validAddress = draft.address.trim().length > 0
  const validName = draft.name.trim().length > 0
  const canSave = visitorMode
    ? validName && validAddress && testStatus === 'success'
    : isNvrMode
      ? validName && validAddress && testStatus === 'success' && selectedChannels.length > 0
      : validName && validAddress && testStatus === 'success'

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title={visitorMode ? 'Add temporary camera' : isNvrMode ? 'Add cameras from NVR' : 'Add real camera'}
      maxWidth={isNvrMode && scanRows.length > 0 ? 'max-w-[760px]' : 'max-w-[620px]'}
      footer={
        <>
          <Button
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSave || saving}>
            {saving
              ? 'Saving…'
              : visitorMode
                ? 'Add temporary camera'
                : isNvrMode
                  ? `Add ${selectedChannels.length || ''} selected camera${selectedChannels.length === 1 ? '' : 's'}`.trim()
                  : 'Save camera'}
          </Button>
        </>
      }
    >
      <TextField
        label={isNvrMode ? 'Recorder / site name' : 'Camera name'}
        placeholder={isNvrMode ? 'e.g. Office NVR' : 'e.g. Front entrance'}
        value={draft.name}
        onChange={(e) => update('name', e.target.value)}
      />
      <TextField
        label="Location"
        placeholder="e.g. Main building"
        value={draft.location}
        onChange={(e) => update('location', e.target.value)}
      />

      {visitorMode ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Connection type"
              value={draft.connectionType}
              onChange={(e) => update('connectionType', e.target.value as ConnectionType)}
            >
              <option value="rtsp">RTSP</option>
              <option value="ip_camera">IP Camera</option>
              <option value="network_camera">Network Camera</option>
            </SelectField>
            <TextField
              label="Camera address"
              placeholder="192.168.1.100 or rtsp://…"
              value={draft.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
          <p className="mb-4 rounded-sm border border-border bg-surface-2 px-3 py-2 text-[11.5px] text-ink-muted">
            Visitor cameras are temporary and use Sentrion sample footage. Real CCTV credentials are only accepted after sign-in.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-start gap-2 rounded-sm border border-accent/30 bg-accent-dim px-3 py-2.5 text-[11.5px] text-accent-text">
            <ShieldCheck size={15} className="mt-[1px] flex-shrink-0" />
            <span>
              Real camera setup is private to your account. Sentrion encrypts the RTSP URL and credentials before storing them.
            </span>
          </div>

          <SelectField
            label="Device type"
            value={draft.deviceType}
            onChange={(e) => update('deviceType', e.target.value as CameraDeviceType)}
            hint="For a CP PLUS recorder, Sentrion can test several NVR channels and register each working channel as a camera."
          >
            <option value="cp_plus_nvr">CP PLUS DVR / NVR</option>
            <option value="generic_rtsp">Generic RTSP camera</option>
          </SelectField>

          {isNvrMode ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Recorder IP / hostname"
                  placeholder="192.168.1.245"
                  value={draft.address}
                  onChange={(e) => update('address', e.target.value)}
                  hint="Use the NVR's LAN IP address, not its InstaOn Cloud ID."
                />
                <TextField
                  label="RTSP port"
                  type="number"
                  min={1}
                  max={65535}
                  value={draft.rtspPort ?? 554}
                  onChange={(e) => update('rtspPort', Number(e.target.value) || 554)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Connected camera channels"
                  type="number"
                  min={1}
                  max={32}
                  value={draft.channelCount ?? 4}
                  onChange={(e) => update('channelCount', Math.min(32, Math.max(1, Number(e.target.value) || 1)))}
                  hint="Your current CP PLUS NVR has 4 cameras, so leave this at 4."
                />
                <SelectField
                  label="Stream"
                  value={draft.streamProfile ?? 'sub'}
                  onChange={(e) => update('streamProfile', e.target.value as StreamProfile)}
                  hint="Sub stream is recommended for live monitoring and AI."
                >
                  <option value="sub">Sub stream</option>
                  <option value="main">Main stream</option>
                </SelectField>
              </div>
            </>
          ) : (
            <TextField
              label="RTSP URL"
              placeholder="rtsp://192.168.1.100:554/stream"
              value={draft.address}
              onChange={(e) => update('address', e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Username"
              placeholder="sentrion_viewer"
              value={draft.username}
              onChange={(e) => update('username', e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={draft.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <p className="-mt-2 mb-4 text-[11.5px] text-ink-muted">
            Prefer a dedicated viewer account instead of the recorder&apos;s primary administrator account. The Sentrion backend must be on a network that can reach the NVR.
          </p>
        </>
      )}

      {testStatus !== 'idle' && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-sm border px-3 py-[9px] text-[12.5px] ${
            testStatus === 'success'
              ? 'border-success/30 bg-success-dim text-success-text'
              : testStatus === 'error'
                ? 'border-danger/30 bg-danger-dim text-danger-text'
                : 'border-border bg-surface-2 text-ink-secondary'
          }`}
        >
          {testStatus === 'testing' && <Loader2 size={14} className="flex-shrink-0 animate-spin" />}
          {testStatus === 'success' && <CheckCircle2 size={14} className="flex-shrink-0" />}
          {testStatus === 'testing' ? (isNvrMode ? 'Testing NVR channels…' : 'Testing connection…') : testMessage}
        </div>
      )}

      {isNvrMode && scanRows.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-md border border-border bg-surface-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Server size={15} className="text-accent-text" />
              <div>
                <p className="text-[12.5px] font-semibold">NVR channels</p>
                <p className="text-[10.5px] text-ink-muted">Only channels that returned video can be selected.</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const available = scanRows.filter((row) => row.success)
                const allSelected = available.every((row) => channelForms[row.channel]?.selected)
                setChannelForms((prev) => {
                  const next = { ...prev }
                  available.forEach((row) => {
                    next[row.channel] = {
                      selected: !allSelected,
                      name: prev[row.channel]?.name || `${draft.name.trim() || 'Camera'} CH${row.channel}`,
                      location: prev[row.channel]?.location || draft.location.trim(),
                    }
                  })
                  return next
                })
              }}
            >
              Select all
            </Button>
          </div>

          <div className="max-h-[360px] divide-y divide-border overflow-y-auto">
            {scanRows.map((row) => {
              const form = channelForms[row.channel]
              return (
                <div key={row.channel} className={`px-4 py-3 ${row.success ? '' : 'opacity-70'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      aria-label={`Select channel ${row.channel}`}
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[var(--accent)]"
                      disabled={!row.success}
                      checked={Boolean(form?.selected)}
                      onChange={(e) => updateChannel(row.channel, { selected: e.target.checked })}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {row.success ? (
                            <Video size={14} className="text-success-text" />
                          ) : (
                            <XCircle size={14} className="text-danger-text" />
                          )}
                          <span className="text-[12.5px] font-semibold">Channel {row.channel}</span>
                          {row.codec && (
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
                              row.codec.toLowerCase() === 'h264'
                                ? 'border-border text-ink-muted'
                                : 'border-warning/30 bg-warning-dim text-warning-text'
                            }`}>
                              {row.codec.toUpperCase()}{row.width && row.height ? ` · ${row.width}×${row.height}` : ''}
                              {row.codec.toLowerCase() !== 'h264' ? ' · H.264 recommended' : ''}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10.5px] ${row.success ? 'text-success-text' : 'text-danger-text'}`}>
                          {row.success ? 'Video verified' : 'Unavailable'}
                        </span>
                      </div>

                      {row.success ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            aria-label={`Camera name for channel ${row.channel}`}
                            className="h-9 rounded-sm border border-border bg-surface-2 px-3 text-[12px] text-ink-primary outline-none focus:border-accent"
                            value={form?.name ?? ''}
                            onChange={(e) => updateChannel(row.channel, { name: e.target.value })}
                            placeholder={`Camera CH${row.channel}`}
                          />
                          <input
                            aria-label={`Location for channel ${row.channel}`}
                            className="h-9 rounded-sm border border-border bg-surface-2 px-3 text-[12px] text-ink-primary outline-none focus:border-accent"
                            value={form?.location ?? ''}
                            onChange={(e) => updateChannel(row.channel, { location: e.target.value })}
                            placeholder="Location"
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-ink-muted">{row.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Button className="w-full" onClick={handleTestConnection} disabled={!validAddress || testStatus === 'testing'}>
        <RefreshCw size={15} className={testStatus === 'testing' ? 'animate-spin' : ''} />
        {visitorMode ? 'Prepare temporary preview' : isNvrMode ? 'Test NVR channels' : 'Test real connection'}
      </Button>

      {!visitorMode && testStatus !== 'success' && (
        <p className="mt-2 text-center text-[11px] text-ink-muted">
          {isNvrMode
            ? 'Sentrion will test each requested NVR channel before allowing it to be registered.'
            : 'A successful connection test is required before saving a real camera.'}
        </p>
      )}
    </Modal>
  )
}
