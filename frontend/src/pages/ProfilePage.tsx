import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { updateCurrentUser } from '@/services/userService'
import { ProfileCompletion } from '@/components/profile/ProfileCompletion'
import { TextField, SelectField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/common/ErrorState'
import type { User } from '@/types'

export function ProfilePage() {
  const { user, loading, error, refetch } = useCurrentUser()
  const [form, setForm] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (user) setForm(user)
  }, [user])

  if (loading) {
    return <p className="py-16 text-center text-[13px] text-ink-muted">Loading profile…</p>
  }

  if (error || !user) {
    return <ErrorState message={error ?? 'Profile could not be loaded.'} onRetry={refetch} />
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      await updateCurrentUser(form)
      refetch()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-6">
      <div className="mb-7 flex flex-wrap items-center gap-5">
        <div className="relative flex h-[84px] w-[84px] flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-3 text-2xl font-semibold text-ink-muted">
          {user.avatarInitials}
          <button
            aria-label="Change profile photo"
            className="absolute -bottom-0.5 -right-0.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-surface-0 bg-accent text-[#08161B]"
          >
            <Pencil size={12} />
          </button>
        </div>
        <ProfileCompletion
          value={user.profileCompletion}
          hint={
            user.profileCompletion < 100
              ? 'Add a phone number to complete your security profile.'
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          value={form.fullName ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
        <TextField
          label="Email address"
          type="email"
          value={form.email ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <TextField
          label="Phone number"
          type="tel"
          placeholder="+91 00000 00000"
          value={form.phone ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <SelectField
          label="Time zone"
          value={form.timezone ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
        >
          <option>Asia/Kolkata (GMT+5:30)</option>
          <option>UTC</option>
        </SelectField>
      </div>

      {saveError && (
        <p className="mt-4 rounded-sm border border-danger/30 bg-danger-dim px-3 py-2 text-[12.5px] text-danger-text">
          {saveError}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2.5 border-t border-border pt-[18px]">
        <Button onClick={() => setForm(user)}>Discard changes</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </div>
  )
}
