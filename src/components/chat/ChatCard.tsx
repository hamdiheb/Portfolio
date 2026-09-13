import * as React from 'react'

import { PromptInput } from '@/components/ui/ai-chat-input'
import { cn } from '@/lib/utils'
import type { ChatMessage } from './mockChat'

interface ChatCardProps {
  messages: ChatMessage[]
  onSubmit: (value: string) => void
  isThinking: boolean
  className?: string
}

export function ChatCard({
  messages,
  onSubmit,
  isThinking,
  className,
}: ChatCardProps) {
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="flex max-h-96 flex-col gap-2 overflow-y-auto py-1"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[80%] whitespace-pre-line rounded-3xl px-4 py-2.5 text-sm',
              message.role === 'user'
                ? 'self-end border border-border bg-background text-foreground shadow-sm'
                : 'self-start bg-foreground text-background',
            )}
          >
            {message.content}
          </div>
        ))}
        {isThinking && (
          <div className="max-w-[80%] self-start rounded-3xl bg-foreground px-4 py-2.5 text-sm text-background">
            Thinking…
          </div>
        )}
      </div>
      <PromptInput
        onSubmit={(value) => onSubmit(value)}
        disabled={isThinking}
        placeholder="Send Message"
        models={['CV Assistant']}
        efforts={['Concise', 'Balanced', 'Detailed']}
      />
    </div>
  )
}
