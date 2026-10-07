import * as React from 'react'

import { checkHealth, streamChat, type ChatMessage } from './cvChatApi'

const HISTORY_SENT = 8

const greeting = (): ChatMessage => ({
  id: 'greeting',
  role: 'bot',
  content:
    "Hi! I'm Iheb's AI assistant, answering from his CV. Ask me about my experience, skills, projects or education.",
  createdAt: Date.now(),
})

interface CvChatValue {
  messages: ChatMessage[]
  isStreaming: boolean
  /** null while the first health check is in flight. */
  online: boolean | null
  send: (text: string) => void
  reset: () => void
  /** Whether the chat popup is open; the launcher and hero both control it. */
  isOpen: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

const CvChatContext = React.createContext<CvChatValue | null>(null)

/** One conversation shared by the hero card and the floating chat. */
export function CvChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [greeting()])
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [online, setOnline] = React.useState<boolean | null>(null)
  const [isOpen, setOpen] = React.useState(false)
  const abortRef = React.useRef<AbortController | null>(null)
  // Lets `send` read the latest messages without being recreated on every chunk.
  const messagesRef = React.useRef(messages)
  React.useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  React.useEffect(() => {
    const controller = new AbortController()
    checkHealth(controller.signal).then((ok) => {
      if (!controller.signal.aborted) setOnline(ok)
    })
    return () => controller.abort()
  }, [])

  React.useEffect(() => () => abortRef.current?.abort(), [])

  const send = React.useCallback(
    (text: string) => {
      const question = text.trim()
      if (!question || isStreaming) return

      const history = messagesRef.current
        .filter((m) => m.id !== 'greeting' && !m.error && m.content)
        .slice(-HISTORY_SENT)
        .map(({ role, content }) => ({ role, content }))

      const botId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: question, createdAt: Date.now() },
        { id: botId, role: 'bot', content: '', createdAt: Date.now() },
      ])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller
      const patchBot = (patch: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === botId ? patch(m) : m)))

      streamChat(
        question,
        history,
        (chunk) => patchBot((m) => ({ ...m, content: m.content + chunk })),
        controller.signal,
      )
        .then(() => setOnline(true))
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          setOnline(false)
          patchBot((m) => ({
            ...m,
            error: true,
            content:
              err instanceof Error && err.message !== 'Failed to fetch'
                ? err.message
                : "I can't reach my assistant right now. Please try again in a moment.",
          }))
        })
        .finally(() => {
          if (abortRef.current === controller) {
            abortRef.current = null
            setIsStreaming(false)
          }
        })
    },
    [isStreaming],
  )

  const reset = React.useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setMessages([greeting()])
  }, [])

  const value = React.useMemo(
    () => ({ messages, isStreaming, online, send, reset, isOpen, setOpen }),
    [messages, isStreaming, online, send, reset, isOpen],
  )

  return <CvChatContext.Provider value={value}>{children}</CvChatContext.Provider>
}

export function useCvChat() {
  const ctx = React.useContext(CvChatContext)
  if (!ctx) throw new Error('useCvChat must be used inside <CvChatProvider>')
  return ctx
}
