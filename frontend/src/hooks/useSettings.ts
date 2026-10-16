import { useCallback, useEffect, useState } from 'react'
import type {
  SecuritySettings,
  CameraSettings,
  NotificationSettings,
  PrivacySettings,
} from '@/types'
import {
  getAllSettings,
  updateSecuritySettings,
  updateCameraSettings,
  updateNotificationSettings,
  updatePrivacySettings,
} from '@/services/settingsService'

export function useSettings() {
  const [security, setSecurity] = useState<SecuritySettings | null>(null)
  const [camera, setCamera] = useState<CameraSettings | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSettings()
      .then((all) => {
        setSecurity(all.security)
        setCamera(all.camera)
        setNotifications(all.notifications)
        setPrivacy(all.privacy)
      })
      .finally(() => setLoading(false))
  }, [])

  const patchSecurity = useCallback(async (patch: Partial<SecuritySettings>) => {
    setSecurity((prev) => (prev ? { ...prev, ...patch } : prev))
    await updateSecuritySettings(patch)
  }, [])

  const patchCamera = useCallback(async (patch: Partial<CameraSettings>) => {
    setCamera((prev) => (prev ? { ...prev, ...patch } : prev))
    await updateCameraSettings(patch)
  }, [])

  const patchNotifications = useCallback(async (patch: Partial<NotificationSettings>) => {
    setNotifications((prev) => (prev ? { ...prev, ...patch } : prev))
    await updateNotificationSettings(patch)
  }, [])

  const patchPrivacy = useCallback(async (patch: Partial<PrivacySettings>) => {
    setPrivacy((prev) => (prev ? { ...prev, ...patch } : prev))
    await updatePrivacySettings(patch)
  }, [])

  return {
    security,
    camera,
    notifications,
    privacy,
    loading,
    patchSecurity,
    patchCamera,
    patchNotifications,
    patchPrivacy,
  }
}
