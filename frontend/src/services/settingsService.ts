/**
 * NOT part of the backend foundation stage's 8 resources (users, profile,
 * cameras, alerts, activity, security-events, notifications, dashboard).
 * A /api/settings resource — and deciding whether it's one table or four
 * (matching the four settings groups below) — is planned for a later
 * backend iteration. FUTURE comments below are the intended shape, not
 * yet backed by an implemented router.
 */
import type {
  SecuritySettings,
  CameraSettings,
  NotificationSettings,
  PrivacySettings,
} from '@/types'
import {
  mockSecuritySettings,
  mockCameraSettings,
  mockNotificationSettings,
  mockPrivacySettings,
} from '@/data/mockSettings'
import { mockDelay } from './api'

/**
 * FUTURE: GET /api/settings
 */
export async function getAllSettings() {
  return mockDelay({
    security: mockSecuritySettings,
    camera: mockCameraSettings,
    notifications: mockNotificationSettings,
    privacy: mockPrivacySettings,
  })
}

/**
 * FUTURE: PATCH /api/settings/security
 */
export async function updateSecuritySettings(
  patch: Partial<SecuritySettings>,
): Promise<SecuritySettings> {
  return mockDelay({ ...mockSecuritySettings, ...patch })
}

/**
 * FUTURE: PATCH /api/settings/camera
 */
export async function updateCameraSettings(
  patch: Partial<CameraSettings>,
): Promise<CameraSettings> {
  return mockDelay({ ...mockCameraSettings, ...patch })
}

/**
 * FUTURE: PATCH /api/settings/notifications
 */
export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  return mockDelay({ ...mockNotificationSettings, ...patch })
}

/**
 * FUTURE: PATCH /api/settings/privacy
 */
export async function updatePrivacySettings(
  patch: Partial<PrivacySettings>,
): Promise<PrivacySettings> {
  return mockDelay({ ...mockPrivacySettings, ...patch })
}
