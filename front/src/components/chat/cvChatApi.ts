export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  createdAt: number
  error?: boolean
}

// Empty in dev: Vite proxies /api to the local backend (see vite.config.ts).
const API_URL = import.meta.env.VITE_API_URL ?? ''

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { signal })
    return res.ok
  } catch {
    return false
  }
}

/** Streams the assistant's answer, calling `onChunk` as text arrives. */
export async function streamChat(
  message: string,
  history: Pick<ChatMessage, 'role' | 'content'>[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? 'The assistant is unavailable right now.')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}
