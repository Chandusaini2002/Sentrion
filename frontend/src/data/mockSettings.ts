/**
 * TEMPORARY UI DATA — replace with GET /api/settings once the
 * FastAPI backend is in place.
 */
import type {
  SecuritySettings,
  CameraSettings,
  NotificationSettings,
  PrivacySettings,
} from '@/types'

export const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  signInEmailAlerts: true,
}

export const mockCameraSettings: CameraSettings = {
  autoReconnect: true,
  defaultConnectionType: 'rtsp',
  personDetection: true,
  unknownFaceAlerts: true,
}

export const mockNotificationSettings: NotificationSettings = {
  criticalAlerts: true,
  emailNotifications: false,
  systemNotifications: true,
}

export const mockPrivacySettings: PrivacySettings = {
  videoRetentionDays: 7,
}
