import * as React from 'react'

import { ChatCard } from './ChatCard'
import { getMockReply, type ChatMessage } from './mockChat'

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'bot',
  content:
    'Hi! Ask me anything about my background — real CV-grounded answers are coming soon; this is a mocked preview for now.',
}

interface ChatSectionProps {
  className?: string
}

export function ChatSection({ className }: ChatSectionProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([GREETING])
  const [isThinking, setIsThinking] = React.useState(false)

  async function handleSubmit(value: string) {
    const trimmed = value.trim()
    if (!trimmed || isThinking) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: trimmed },
    ])
    setIsThinking(true)

    const reply = await getMockReply(trimmed)

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'bot', content: reply },
    ])
    setIsThinking(false)
  }

  return (
    <ChatCard
      className={className}
      messages={messages}
      onSubmit={handleSubmit}
      isThinking={isThinking}
    />
  )
}
