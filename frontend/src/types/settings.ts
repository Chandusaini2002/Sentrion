/**
 * Shape of the Settings page state. Mirrors the future FastAPI
 * `UserSettings` schema (one row per user, PATCHed per section).
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean
  signInEmailAlerts: boolean
}

export interface CameraSettings {
  autoReconnect: boolean
  defaultConnectionType: 'rtsp' | 'ip_camera'
  personDetection: boolean
  unknownFaceAlerts: boolean
}

export interface NotificationSettings {
  criticalAlerts: boolean
  emailNotifications: boolean
  systemNotifications: boolean
}

export interface PrivacySettings {
  videoRetentionDays: 7 | 14 | 30
}
