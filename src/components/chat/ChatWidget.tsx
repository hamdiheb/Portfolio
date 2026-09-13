import * as React from 'react'
import { Maximize2, X } from 'lucide-react'

import { ChatSection } from './ChatSection'

export type ChatMode = 'hidden' | 'open' | 'compact'

interface ChatWidgetProps {
  mode: ChatMode
  onCollapse: () => void
  onExpand: () => void
  onClose: () => void
}

export function ChatWidget({
  mode,
  onCollapse,
  onExpand,
  onClose,
}: ChatWidgetProps) {
  React.useEffect(() => {
    document.body.style.overflow = mode === 'open' ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mode])

  React.useEffect(() => {
    if (mode !== 'open') return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCollapse()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode, onCollapse])

  if (mode === 'hidden') return null

  if (mode === 'open') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-background/60 backdrop-blur-md"
          onClick={onCollapse}
          aria-hidden="true"
        />
        <div
          className="relative z-10 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Shrink chat"
            className="absolute -top-3 -right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground/70 shadow-sm transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <ChatSection />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-xs">
      <div className="relative">
        <div className="absolute -top-3 -right-3 z-20 flex gap-1.5">
          <button
            type="button"
            onClick={onExpand}
            aria-label="Expand chat"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground/70 shadow-sm transition-colors hover:text-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground/70 shadow-sm transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <ChatSection />
      </div>
    </div>
  )
}
