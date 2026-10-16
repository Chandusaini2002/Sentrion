import type { AccountStatus, User } from '@/types'
import { apiFetch } from './api'
import { initialsFromName } from '@/lib/format'

export interface ProfileReadResponse {
  id: string
  user_id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  timezone: string
  account_status: AccountStatus
  profile_completion: number
  created_at: string
  updated_at: string
}

export function toUser(profile: ProfileReadResponse): User {
  return {
    id: profile.user_id,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    avatarInitials: initialsFromName(profile.full_name || profile.email),
    accountStatus: profile.account_status,
    timezone: profile.timezone,
    profileCompletion: profile.profile_completion,
  }
}

export async function getCurrentUser(): Promise<User> {
  const profile = await apiFetch<ProfileReadResponse>('/auth/me')
  return toUser(profile)
}

export async function updateCurrentUser(patch: Partial<User>): Promise<User> {

  const profileBody: Record<string, unknown> = {}
  if (patch.fullName !== undefined) profileBody.full_name = patch.fullName
  if (patch.phone !== undefined) profileBody.phone = patch.phone || null
  if (patch.avatarUrl !== undefined) profileBody.avatar_url = patch.avatarUrl || null
  if (patch.timezone !== undefined) profileBody.timezone = patch.timezone

  if (patch.email !== undefined) {
    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ email: patch.email }),
    })
  }

  const profile = Object.keys(profileBody).length
    ? await apiFetch<ProfileReadResponse>('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(profileBody),
      })
    : await apiFetch<ProfileReadResponse>('/profile/me')

  return toUser(profile)
}
