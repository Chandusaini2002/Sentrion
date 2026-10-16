/**
 * Represents a registered security camera.
 * Mirrors backend/app/schemas/camera.py `CameraRead` and the `cameras`
 * DB table (see backend/app/models/camera.py).
 */
export type CameraStatus = 'online' | 'offline'
export type ConnectionType = 'ip_camera' | 'rtsp' | 'network_camera'
export type CameraDeviceType = 'cp_plus_nvr' | 'generic_rtsp'
export type StreamProfile = 'main' | 'sub'

export interface Camera {
  id: string
  name: string
  location: string | null
  /** Redacted display address only — never raw credentials. */
  address: string | null
  connectionType: ConnectionType
  status: CameraStatus
  hasCredentials: boolean
  isEnabled: boolean
  lastConnection: string | null
  lastActivity?: string | null
  peopleDetected?: number
  username?: string
  streamUrl?: string
  isTemporary?: boolean
}

/** Payload shape for the Add Camera form. */
export interface CameraDraft {
  name: string
  location: string
  address: string
  connectionType: ConnectionType
  username?: string
  password?: string
  /** Logged-in camera setup fields. Visitor mode ignores these. */
  deviceType?: CameraDeviceType
  rtspPort?: number
  channel?: number
  channelCount?: number
  streamProfile?: StreamProfile
}

export interface CameraConnectionTestResult {
  success: boolean
  reachable: boolean
  streamVerified: boolean
  message: string
  rtspUrl: string
  host: string
  port: number
  codec?: string | null
  width?: number | null
  height?: number | null
}

export interface NvrChannelProbe {
  channel: number
  success: boolean
  reachable: boolean
  streamVerified: boolean
  message: string
  rtspUrl: string
  codec?: string | null
  width?: number | null
  height?: number | null
}

export interface NvrScanResult {
  address: string
  rtspPort: number
  channelCount: number
  streamProfile: StreamProfile
  successfulChannels: number
  channels: NvrChannelProbe[]
}

export interface NvrChannelSelection {
  channel: number
  name: string
  location: string
}

export interface CameraStreamInfo {
  available: boolean
  message: string
  pathName?: string | null
  webrtcUrl?: string | null
  hlsUrl?: string | null
}

export type ConnectionTestStatus = 'idle' | 'testing' | 'success' | 'error'
