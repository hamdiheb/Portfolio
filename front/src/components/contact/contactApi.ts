// Empty in dev: Vite proxies /api to the local backend (see vite.config.ts).
const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface ContactInput {
  name: string
  email: string
  message: string
  /** Honeypot: hidden from people, filled by bots. */
  website: string
}

export type ContactResult =
  | { ok: true }
  /** `unavailable`: the form can't deliver right now (offline, not configured, rate limited). */
  | { ok: false; kind: 'invalid' | 'unavailable'; error: string }

const TIMEOUT_MS = 20_000

export async function sendContact(input: ContactInput): Promise<ContactResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    })
    if (res.ok) return { ok: true }

    const body = (await res.json().catch(() => null)) as { error?: string } | null
    if (res.status === 400) {
      return { ok: false, kind: 'invalid', error: body?.error ?? 'Please check the form and try again.' }
    }
    return {
      ok: false,
      kind: 'unavailable',
      error:
        res.status === 429
          ? (body?.error ?? 'Too many messages — please try again in a few minutes.')
          : "The contact form isn't available right now.",
    }
  } catch {
    return { ok: false, kind: 'unavailable', error: "Your message couldn't be sent — the server didn't respond." }
  } finally {
    clearTimeout(timer)
  }
}
