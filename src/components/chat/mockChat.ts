export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
}

const MOCK_REPLIES = [
  "That's a great question — once I'm connected to the real CV data, I'll have a proper answer for you.",
  "I'm still a placeholder for now, but soon I'll answer that using the CV directly.",
  'Good question! Real, CV-grounded answers are coming soon — for now this is a mocked reply.',
]

// Stand-in for the future RAG/LLM call — swap this implementation only.
export async function getMockReply(userMessage: string): Promise<string> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1200 + Math.random() * 600),
  )
  const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
  return `${reply}\n\n(You asked: "${userMessage.trim()}")`
}
