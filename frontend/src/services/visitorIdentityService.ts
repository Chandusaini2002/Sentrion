import type { User } from '@/types'

// Kept as a compatibility export for components that need a display identity
// before sign-in. Nothing in the visible UI adds a special visitor label.
export const visitorUser: User = {
  id: 'visitor',
  fullName: 'Visitor',
  email: '',
  avatarInitials: 'V',
  accountStatus: 'active',
  timezone: 'Asia/Kolkata',
  profileCompletion: 0,
}
