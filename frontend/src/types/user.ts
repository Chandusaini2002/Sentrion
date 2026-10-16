/**
 * Represents the current account and their security profile — a
 * frontend-friendly combination of backend/app/schemas/profile.py
 * `ProfileRead` (full_name, phone, avatar_url, timezone, account_status,
 * profile_completion) with `avatarInitials` computed client-side (see
 * lib/format.ts `initialsFromName`), since the backend has no such field.
 */
export type AccountStatus = 'active' | 'suspended' | 'pending'

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  avatarUrl?: string
  avatarInitials: string
  accountStatus: AccountStatus
  timezone: string
  /** 0-100. Drives the profile completion progress bar. */
  profileCompletion: number
}
