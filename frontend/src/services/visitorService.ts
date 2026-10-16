import type {
  AppNotification,
  Camera,
  CameraDraft,
  DetectionSnapshot,
  SecurityAlert,
  SecurityEvent,
} from '@/types'
import { API_ORIGIN, apiFetch } from './api'
import type { DashboardStats } from './dashboardService'

const STORAGE_KEY = 'sentrion.visitor.cameras.v1'
const PUBLIC_VIDEO_URLS = [
  `${API_ORIGIN}/public-media/front-entrance.mp4`,
  `${API_ORIGIN}/public-media/rear-parking.mp4`,
  `${API_ORIGIN}/public-media/main-corridor.mp4`,
  `${API_ORIGIN}/public-media/loading-dock.mp4`,
  `${API_ORIGIN}/public-media/server-room.mp4`,
  `${API_ORIGIN}/public-media/west-gate.mp4`,
]

function randomVisitorVideoUrl(): string {
  return PUBLIC_VIDEO_URLS[Math.floor(Math.random() * PUBLIC_VIDEO_URLS.length)] ?? PUBLIC_VIDEO_URLS[0]
}

interface PublicCameraResponse {
  id: string
  name: string
  location: string | null
  address: string | null
  connection_type: Camera['connectionType']
  status: Camera['status']
  has_credentials: boolean
  is_enabled: boolean
  last_connection_at: string | null
  last_activity_at: string | null
  people_detected: number
  stream_url: string | null
}

interface PublicDashboardResponse {
  total_cameras: number
  cameras_online: number
  cameras_offline: number
  active_alerts: number
  people_detected_today: number
  security_events_7d: number
}

interface PublicAlertResponse {
  id: string
  camera_id: string | null
  camera_name: string | null
  type: string
  detection_info: string | null
  severity: SecurityAlert['severity']
  status: SecurityAlert['status']
  occurred_at: string
}

interface PublicEventResponse {
  id: string
  camera_id: string | null
  camera_name: string | null
  event_type: string
  detection_result: string | null
  severity: SecurityEvent['severity']
  status: SecurityEvent['status']
  occurred_at: string
}

interface PublicNotificationResponse {
  id: string
  title: string
  message: string
  severity: AppNotification['severity']
  is_read: boolean
  created_at: string
}

function toPublicCamera(c: PublicCameraResponse): Camera {
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
    streamUrl: c.stream_url ? `${API_ORIGIN}${c.stream_url}` : undefined,
  }
}

function safeStoredAddress(address: string): string {
  const value = address.trim()
  if (!value) return ''
  try {
    const url = new URL(value)
    url.username = ''
    url.password = ''
    return url.toString()
  } catch {
    return value
  }
}

export function getTemporaryVisitorCameras(): Camera[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const cameras = JSON.parse(raw) as Camera[]
    return Array.isArray(cameras) ? cameras : []
  } catch {
    return []
  }
}

function saveTemporaryVisitorCameras(cameras: Camera[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cameras))
}

export async function getVisitorBaseCameras(): Promise<Camera[]> {
  const rows = await apiFetch<PublicCameraResponse[]>('/public/cameras')
  return rows.map(toPublicCamera)
}

export async function getVisitorCameras(): Promise<Camera[]> {
  const base = await getVisitorBaseCameras()
  return [...getTemporaryVisitorCameras(), ...base]
}

export async function createTemporaryVisitorCamera(draft: CameraDraft): Promise<Camera> {
  const now = new Date().toISOString()
  const camera: Camera = {
    id: `visitor-temp-${crypto.randomUUID()}`,
    name: draft.name.trim(),
    location: draft.location.trim() || 'Temporary visitor camera',
    address: safeStoredAddress(draft.address),
    connectionType: draft.connectionType,
    status: 'online',
    hasCredentials: Boolean(draft.username || draft.password),
    isEnabled: true,
    lastConnection: now,
    lastActivity: now,
    peopleDetected: 0,
    isTemporary: true,
    streamUrl: randomVisitorVideoUrl(),
  }
  const next = [camera, ...getTemporaryVisitorCameras()]
  saveTemporaryVisitorCameras(next)
  return camera
}

export async function deleteTemporaryVisitorCamera(id: string): Promise<void> {
  const current = getTemporaryVisitorCameras()
  if (!current.some((camera) => camera.id === id)) {
    throw new Error('Visitor sample cameras are view-only.')
  }
  saveTemporaryVisitorCameras(current.filter((camera) => camera.id !== id))
}

export async function testTemporaryVisitorCamera(): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: 'Temporary preview ready. The visitor camera will use the sample live feed for this browser session.',
  }
}

export async function getVisitorDashboardStats(): Promise<DashboardStats> {
  const s = await apiFetch<PublicDashboardResponse>('/public/dashboard/summary')
  const temporary = getTemporaryVisitorCameras()
  return {
    totalCameras: s.total_cameras + temporary.length,
    camerasOnline: s.cameras_online + temporary.filter((c) => c.status === 'online').length,
    camerasOffline: s.cameras_offline + temporary.filter((c) => c.status === 'offline').length,
    activeAlerts: s.active_alerts,
    peopleDetected: s.people_detected_today,
    securityEvents: s.security_events_7d,
  }
}

export async function getVisitorAlerts(): Promise<SecurityAlert[]> {
  const rows = await apiFetch<PublicAlertResponse[]>('/public/alerts')
  return rows.map((a) => ({
    id: a.id,
    type: a.type,
    cameraId: a.camera_id,
    cameraName: a.camera_name,
    timestamp: a.occurred_at,
    detectionInfo: a.detection_info,
    severity: a.severity,
    status: a.status,
  }))
}

export async function getVisitorSecurityEvents(limit = 5): Promise<SecurityEvent[]> {
  const rows = await apiFetch<PublicEventResponse[]>(`/public/security-events?limit=${limit}`)
  return rows.map((e) => ({
    id: e.id,
    timestamp: e.occurred_at,
    cameraId: e.camera_id,
    cameraName: e.camera_name,
    eventType: e.event_type,
    detectionResult: e.detection_result,
    severity: e.severity,
    status: e.status,
  }))
}

export async function getVisitorNotifications(): Promise<AppNotification[]> {
  const rows = await apiFetch<PublicNotificationResponse[]>('/public/notifications')
  return rows.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    timestamp: n.created_at,
    read: n.is_read,
    severity: n.severity,
  }))
}

export async function getVisitorDetectionSnapshot(cameraId: string): Promise<DetectionSnapshot> {
  const row = await apiFetch<{
    camera_id: string
    people_count: number
    faces_recognized: number
    confidence: number
    unknown_person: boolean
    updated_at: string
  }>(`/public/detection/${cameraId}`)

  return {
    cameraId: row.camera_id,
    peopleDetected: row.people_count,
    faceDetections: row.faces_recognized,
    detectionConfidence: Math.round(row.confidence * 100),
    unknownPersonDetected: row.unknown_person,
    recognizedProfiles: [],
    recentEvents: [
      {
        id: `${cameraId}-${row.updated_at}`,
        label: row.people_count > 0 ? `${row.people_count} person${row.people_count === 1 ? '' : 's'} detected` : 'No active detection',
        timestamp: row.updated_at,
        severity: row.unknown_person ? 'warning' : 'info',
      },
    ],
  }
}
