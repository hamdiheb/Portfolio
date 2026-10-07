import * as React from 'react'
import { RotateCcw, Send, User, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import profileImg from '@/assets/profile.jpeg'
import { useCvChat } from './CvChatProvider'
import type { ChatMessage } from './cvChatApi'

const SUGGESTED_QUESTIONS = [
  'What programming languages do you work with?',
  'Can you tell me about your latest project?',
  'Where are you based?',
]

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

function Avatar({ className }: { className?: string }) {
  return (
    <img
      src={profileImg}
      alt=""
      className={cn('shrink-0 rounded-full object-cover object-top', className)}
    />
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" role="status" aria-label="Typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

function Message({ message }: { message: ChatMessage }) {
  const time = <p className="mt-1 text-[11px] text-muted-foreground">{timeFormat.format(message.createdAt)}</p>

  if (message.role === 'user') {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="flex max-w-[80%] flex-col items-end">
          <div className="rounded-2xl rounded-tr-md bg-assistant px-3.5 py-2.5 text-sm text-white shadow-sm">
            {message.content}
          </div>
          {time}
        </div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-assistant-soft text-assistant-ink">
          <User className="h-4 w-4" />
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-7 w-7" />
      <div className="flex max-w-[85%] flex-col">
        <div
          className={cn(
            'whitespace-pre-line rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm text-foreground',
            message.error && 'bg-destructive/10 text-destructive',
          )}
        >
          {message.content || <TypingDots />}
        </div>
        {message.content && time}
      </div>
    </div>
  )
}

interface CvChatPanelProps {
  className?: string
  /** Height-capped scroll area for the message list. */
  listClassName?: string
  inputRef?: React.Ref<HTMLInputElement>
  onClose?: () => void
}

export function CvChatPanel({ className, listClassName, inputRef, onClose }: CvChatPanelProps) {
  const { messages, isStreaming, online, send, reset } = useCvChat()
  const [draft, setDraft] = React.useState('')
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const list = listRef.current
    list?.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || isStreaming) return
    send(draft)
    setDraft('')
  }

  const status = isStreaming ? 'Typing…' : online === false ? 'Offline' : 'Online'
  const onlyGreeting = messages.length === 1

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-3xl border bg-card text-left text-card-foreground shadow-[0_24px_60px_-20px_rgba(79,70,229,0.35)]',
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">My AI Assistant</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(
                'h-2 w-2 rounded-full',
                online === false ? 'bg-muted-foreground/50' : 'bg-emerald-500',
              )}
            />
            {status}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label="Start a new conversation"
          title="New conversation"
          className="grid h-9 w-9 place-items-center rounded-full bg-assistant-soft text-assistant-ink transition-transform hover:scale-105"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className={cn('flex flex-col gap-4 overflow-y-auto px-4 py-4', listClassName)}
      >
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        {onlyGreeting && (
          <div className="flex flex-col items-end gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-2xl rounded-tr-md bg-assistant-soft px-3.5 py-2 text-left text-sm text-assistant-ink transition-colors hover:bg-assistant hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t px-4 py-3">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="Ask me anything about my CV…"
          aria-label="Ask my AI assistant a question about my CV"
          // 16px on mobile: iOS Safari zooms into any focused input smaller than that.
          className="h-11 min-w-0 flex-1 rounded-full border bg-background px-4 text-base text-foreground sm:text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-assistant/40"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isStreaming}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-assistant text-white shadow-md transition-[transform,opacity] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
