import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { apiFetch } from '@/services/api'
import { TextField } from '@/components/common/FormField'
import { Button } from '@/components/common/Button'
export function AuthPage({signup = false}: {signup?: boolean}) {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (user) return <Navigate to="/dashboard" replace />
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    if (signup && password !== confirm) { setError('Passwords do not match.'); return }
    if (signup && new TextEncoder().encode(password).length > 72) { setError('Password must be at most 72 UTF-8 bytes.'); return }
    setBusy(true)
    try {
      if (signup) await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({full_name: name.trim(), email: email.trim(), password}) })
      await login(email.trim(), password)
      navigate('/dashboard', {replace: true})
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.') }
    finally { setBusy(false) }
  }
  return <main className="flex min-h-screen items-center justify-center px-4 py-12">
    <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-border bg-surface-1 p-7">
      <Link to="/" className="mb-6 flex items-center gap-2 text-xl font-semibold"><Shield className="text-accent" /> Sentrion</Link>
      <h1 className="mb-2 text-2xl font-semibold">{signup ? 'Create your account' : 'Sign in'}</h1>
      <p className="mb-7 text-sm text-ink-secondary">Your cameras. Your private security dashboard.</p>
      <fieldset disabled={busy}>
        {signup && <TextField label="Full name" autoComplete="name" required maxLength={255} value={name} onChange={e => setName(e.target.value)} />}
        <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} />
        {signup && <><p className="mb-3 text-xs text-ink-muted">At least 8 characters; at most 72 UTF-8 bytes.</p><TextField label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></>}
        {error && <p role="alert" className="mb-4 text-sm text-danger-text">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</Button>
      </fieldset>
      <p className="mt-5 text-sm text-ink-secondary">{signup ? 'Already registered? ' : 'New to Sentrion? '}<Link className="text-accent-text underline" to={signup ? '/login' : '/signup'} onClick={() => {setError(''); setPassword(''); setConfirm('')}}>{signup ? 'Sign in' : 'Sign up'}</Link></p>
      <Link to="/" className="mt-4 block text-xs text-ink-muted">Back to visitor dashboard</Link>
    </form>
  </main>
}
