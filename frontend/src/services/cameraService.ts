import type {
  Camera,
  CameraConnectionTestResult,
  CameraDraft,
  CameraStatus,
  CameraStreamInfo,
  ConnectionType,
  NvrChannelProbe,
  NvrChannelSelection,
  NvrScanResult,
  StreamProfile,
} from '@/types'
import { apiFetch, toQueryString } from './api'

interface CameraReadResponse {
  id: string
  owner_id: string
  name: string
  location: string | null
  connection_type: ConnectionType
  address: string | null
  has_credentials: boolean
  status: CameraStatus
  is_enabled: boolean
  last_connection_at: string | null
  last_activity_at: string | null
  people_detected: number
  created_at: string
  updated_at: string
}

interface ConnectionTestResponse {
  success: boolean
  reachable: boolean
  stream_verified: boolean
  message: string
  rtsp_url: string
  host: string
  port: number
  codec: string | null
  width: number | null
  height: number | null
}

interface NvrChannelProbeResponse {
  channel: number
  success: boolean
  reachable: boolean
  stream_verified: boolean
  message: string
  rtsp_url: string
  codec: string | null
  width: number | null
  height: number | null
}

interface NvrScanResponse {
  address: string
  rtsp_port: number
  channel_count: number
  stream_profile: StreamProfile
  successful_channels: number
  channels: NvrChannelProbeResponse[]
}

interface CameraStreamResponse {
  available: boolean
  message: string
  path_name: string | null
  webrtc_url: string | null
  hls_url: string | null
}

function toCamera(c: CameraReadResponse): Camera {
  return {
    id: c.id,
    name: c.name,
    location: c.location,
    address: c.address,
    connectionType: c.connection_type,
    status: c.status,
    hasCredentials: c.has_credentials,
    isEnabled: c.is_enabled,
    lastConnection: c.last_connection_at,
    lastActivity: c.last_activity_at,
    peopleDetected: c.people_detected,
  }
}

function toConnectionResult(r: ConnectionTestResponse): CameraConnectionTestResult {
  return {
    success: r.success,
    reachable: r.reachable,
    streamVerified: r.stream_verified,
    message: r.message,
    rtspUrl: r.rtsp_url,
    host: r.host,
    port: r.port,
    codec: r.codec,
    width: r.width,
    height: r.height,
  }
}

function toNvrProbe(r: NvrChannelProbeResponse): NvrChannelProbe {
  return {
    channel: r.channel,
    success: r.success,
    reachable: r.reachable,
    streamVerified: r.stream_verified,
    message: r.message,
    rtspUrl: r.rtsp_url,
    codec: r.codec,
    width: r.width,
    height: r.height,
  }
}

function buildCpPlusRtspUrl(draft: CameraDraft): string {
  const host = draft.address.trim()
  const port = draft.rtspPort ?? 554
  const channel = draft.channel ?? 1
  const subtype = draft.streamProfile === 'main' ? 0 : 1
  return `rtsp://${host}:${port}/cam/realmonitor?channel=${channel}&subtype=${subtype}`
}

function finalRtspUrl(draft: CameraDraft): string {
  return draft.deviceType === 'cp_plus_nvr' ? buildCpPlusRtspUrl(draft) : draft.address.trim()
}

export async function getCameras(): Promise<Camera[]> {
  const cameras = await apiFetch<CameraReadResponse[]>(`/cameras${toQueryString({})}`)
  return cameras.map(toCamera)
}

export async function getCameraById(id: string): Promise<Camera | undefined> {
  try {
    const camera = await apiFetch<CameraReadResponse>(`/cameras/${id}`)
    return toCamera(camera)
  } catch {
    return undefined
  }
}

export async function createCamera(draft: CameraDraft): Promise<Camera> {
  const rtspUrl = finalRtspUrl(draft)
  const camera = await apiFetch<CameraReadResponse>('/cameras', {
    method: 'POST',
    body: JSON.stringify({
      name: draft.name,
      location: draft.location || null,
      connection_type: 'rtsp',
      ip_address: null,
      rtsp_url: rtspUrl,
      username: draft.username || null,
      password: draft.password || null,
      verify_connection: true,
    }),
  })
  return toCamera(camera)
}

export async function createNvrChannels(
  draft: CameraDraft,
  channels: NvrChannelSelection[],
): Promise<Camera[]> {
  const rows = await apiFetch<CameraReadResponse[]>('/cameras/nvr-channels', {
    method: 'POST',
    body: JSON.stringify({
      address: draft.address,
      rtsp_port: draft.rtspPort ?? 554,
      stream_profile: draft.streamProfile ?? 'sub',
      username: draft.username || null,
      password: draft.password || null,
      channels: channels.map((channel) => ({
        channel: channel.channel,
        name: channel.name,
        location: channel.location || null,
      })),
    }),
  })
  return rows.map(toCamera)
}

export async function scanNvrChannels(draft: CameraDraft): Promise<NvrScanResult> {
  const row = await apiFetch<NvrScanResponse>('/cameras/scan-nvr', {
    method: 'POST',
    body: JSON.stringify({
      address: draft.address,
      rtsp_port: draft.rtspPort ?? 554,
      channel_count: draft.channelCount ?? 4,
      stream_profile: draft.streamProfile ?? 'sub',
      username: draft.username || null,
      password: draft.password || null,
    }),
  })
  return {
    address: row.address,
    rtspPort: row.rtsp_port,
    channelCount: row.channel_count,
    streamProfile: row.stream_profile,
    successfulChannels: row.successful_channels,
    channels: row.channels.map(toNvrProbe),
  }
}

export async function updateCamera(id: string, patch: Partial<CameraDraft>): Promise<Camera> {
  const camera = await apiFetch<CameraReadResponse>(`/cameras/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.location !== undefined && { location: patch.location || null }),
      ...(patch.username !== undefined && { username: patch.username || null }),
      ...(patch.password !== undefined && { password: patch.password || null }),
    }),
  })
  return toCamera(camera)
}

export async function testCameraConnection(draft: CameraDraft): Promise<CameraConnectionTestResult> {
  const row = await apiFetch<ConnectionTestResponse>('/cameras/test-connection', {
    method: 'POST',
    body: JSON.stringify({
      device_type: draft.deviceType ?? 'generic_rtsp',
      address: draft.address,
      rtsp_port: draft.rtspPort ?? 554,
      channel: draft.channel ?? 1,
      stream_profile: draft.streamProfile ?? 'sub',
      username: draft.username || null,
      password: draft.password || null,
    }),
  })
  return toConnectionResult(row)
}

export async function testSavedCameraConnection(id: string): Promise<CameraConnectionTestResult> {
  const row = await apiFetch<ConnectionTestResponse>(`/cameras/${id}/test-connection`, {
    method: 'POST',
  })
  return toConnectionResult(row)
}

export async function getCameraStream(id: string): Promise<CameraStreamInfo> {
  const row = await apiFetch<CameraStreamResponse>(`/cameras/${id}/stream`)
  return {
    available: row.available,
    message: row.message,
    pathName: row.path_name,
    webrtcUrl: row.webrtc_url,
    hlsUrl: row.hls_url,
  }
}

export async function deleteCamera(id: string): Promise<void> {
  return apiFetch<void>(`/cameras/${id}`, { method: 'DELETE' })
}
