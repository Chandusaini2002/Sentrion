// One persistent, expiring session. No credentials in logs or URLs.
const key = 'sentrion.session'
export const SESSION_CHANGED = 'sentrion:session-changed'
export function getToken(): string | null { return localStorage.getItem(key) }
export function setToken(token: string | null) {
  if (token) localStorage.setItem(key, token)
  else localStorage.removeItem(key)
}
