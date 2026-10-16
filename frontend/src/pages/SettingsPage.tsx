import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { SettingsNav, type SettingsSection } from '@/components/settings/SettingsNav'
import { SettingsBlock, SettingsRow } from '@/components/settings/SettingsBlock'
import { Toggle } from '@/components/common/Toggle'
import { TextField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'

export function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>('account')
  const {
    security,
    camera,
    notifications,
    privacy,
    loading,
    patchSecurity,
    patchCamera,
    patchNotifications,
    patchPrivacy,
  } = useSettings()

  return (
    <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[220px_1fr]">
      <SettingsNav active={section} onChange={setSection} />

      <div>
        {loading && <p className="py-16 text-center text-[13px] text-ink-muted">Loading settings…</p>}

        {!loading && section === 'account' && (
          <>
            <SettingsBlock title="Personal information" description="Update the details on your security profile.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Full name" defaultValue="Aditi Rao" />
                <TextField label="Email address" type="email" defaultValue="aditi.rao@sentrion.io" />
              </div>
            </SettingsBlock>
            <SettingsBlock title="Password" description="Change the password used to sign in to your account.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Current password" type="password" placeholder="••••••••" />
                <TextField label="New password" type="password" placeholder="••••••••" />
              </div>
              <Button>Update password</Button>
            </SettingsBlock>
          </>
        )}

        {!loading && section === 'security' && security && (
          <>
            <SettingsBlock title="Login security" description="Control how you sign in and where.">
              <SettingsRow label="Two-factor authentication" description="Require a verification code at sign-in.">
                <Toggle
                  checked={security.twoFactorEnabled}
                  onChange={(v) => patchSecurity({ twoFactorEnabled: v })}
                  label="Two-factor authentication"
                />
              </SettingsRow>
              <SettingsRow label="Sign-in email alerts" description="Get notified of new sign-ins to your account.">
                <Toggle
                  checked={security.signInEmailAlerts}
                  onChange={(v) => patchSecurity({ signInEmailAlerts: v })}
                  label="Sign-in email alerts"
                />
              </SettingsRow>
            </SettingsBlock>
            <SettingsBlock title="Session management" description="Devices currently signed in to your account.">
              <SettingsRow label="MacBook Pro — Jaipur, IN" description="Current session · active now">
                <Badge tone="green" withDot={false}>This device</Badge>
              </SettingsRow>
              <SettingsRow label="iPhone 14 — Jaipur, IN" description="Last active 2 hours ago">
                <Button size="sm" variant="danger">Sign out</Button>
              </SettingsRow>
            </SettingsBlock>
          </>
        )}

        {!loading && section === 'camera' && camera && (
          <>
            <SettingsBlock title="Camera connection settings" description="Defaults applied when adding a new camera.">
              <SettingsRow
                label="Auto-reconnect on failure"
                description="Attempt to restore a dropped camera connection automatically."
              >
                <Toggle
                  checked={camera.autoReconnect}
                  onChange={(v) => patchCamera({ autoReconnect: v })}
                  label="Auto-reconnect on failure"
                />
              </SettingsRow>
              <SettingsRow label="Default connection type" description="Used when no type is specified.">
                <select
                  value={camera.defaultConnectionType}
                  onChange={(e) =>
                    patchCamera({ defaultConnectionType: e.target.value as 'rtsp' | 'ip_camera' })
                  }
                  className="h-[34px] w-40 rounded-sm border border-border bg-surface-2 px-2.5 text-[13px] text-ink-primary outline-none focus:border-accent"
                >
                  <option value="rtsp">RTSP</option>
                  <option value="ip_camera">IP Camera</option>
                </select>
              </SettingsRow>
            </SettingsBlock>
            <SettingsBlock title="Detection settings" description="Tune how sensitive AI detection is across your cameras.">
              <SettingsRow label="Person detection" description="Flag people entering camera view.">
                <Toggle
                  checked={camera.personDetection}
                  onChange={(v) => patchCamera({ personDetection: v })}
                  label="Person detection"
                />
              </SettingsRow>
              <SettingsRow
                label="Unknown face alerts"
                description="Alert when a face doesn't match a recognized profile."
              >
                <Toggle
                  checked={camera.unknownFaceAlerts}
                  onChange={(v) => patchCamera({ unknownFaceAlerts: v })}
                  label="Unknown face alerts"
                />
              </SettingsRow>
            </SettingsBlock>
          </>
        )}

        {!loading && section === 'notifications' && notifications && (
          <SettingsBlock title="Security alerts" description="Choose how you're notified when something needs attention.">
            <SettingsRow label="Critical alerts" description="Push notification for critical severity events.">
              <Toggle
                checked={notifications.criticalAlerts}
                onChange={(v) => patchNotifications({ criticalAlerts: v })}
                label="Critical alerts"
              />
            </SettingsRow>
            <SettingsRow label="Email notifications" description="Daily summary of security events sent to your inbox.">
              <Toggle
                checked={notifications.emailNotifications}
                onChange={(v) => patchNotifications({ emailNotifications: v })}
                label="Email notifications"
              />
            </SettingsRow>
            <SettingsRow
              label="System notifications"
              description="Updates about camera connectivity and system status."
            >
              <Toggle
                checked={notifications.systemNotifications}
                onChange={(v) => patchNotifications({ systemNotifications: v })}
                label="System notifications"
              />
            </SettingsRow>
          </SettingsBlock>
        )}

        {!loading && section === 'privacy' && privacy && (
          <>
            <SettingsBlock title="Video retention" description="Control how long recorded footage is stored.">
              <div className="max-w-[260px]">
                <label className="mb-[7px] block text-[12.5px] font-medium text-ink-secondary">
                  Retention period
                </label>
                <select
                  value={privacy.videoRetentionDays}
                  onChange={(e) =>
                    patchPrivacy({ videoRetentionDays: Number(e.target.value) as 7 | 14 | 30 })
                  }
                  className="h-[38px] w-full appearance-none rounded-sm border border-border bg-surface-2 px-3 text-[13px] text-ink-primary outline-none focus:border-accent"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            </SettingsBlock>
            <SettingsBlock title="Profile data controls" description="Manage the data associated with your account.">
              <SettingsRow label="Download my data" description="Export a copy of your profile and activity history.">
                <Button size="sm">Export</Button>
              </SettingsRow>
              <SettingsRow
                label="Delete account"
                description="Permanently remove your account and all associated data."
              >
                <Button size="sm" variant="danger">Delete account</Button>
              </SettingsRow>
            </SettingsBlock>
          </>
        )}
      </div>
    </div>
  )
}
