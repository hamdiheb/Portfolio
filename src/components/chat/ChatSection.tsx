import * as React from 'react'

import { ChatCard } from './ChatCard'
import { getMockReply, type ChatMessage } from './mockChat'

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'bot',
  content:
    'Hi! Ask me anything about my background — real CV-grounded answers are coming soon; this is a mocked preview for now.',
}

export function ChatSection() {
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
    <section className="mx-auto w-full max-w-md px-4 pt-28 pb-16 sm:pt-36">
      <ChatCard
        messages={messages}
        onSubmit={handleSubmit}
        isThinking={isThinking}
      />
    </section>
  )
}
