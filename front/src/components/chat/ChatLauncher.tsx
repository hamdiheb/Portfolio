import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BotMessageSquare, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CvChatPanel } from './CvChatPanel'
import { useCvChat } from './CvChatProvider'

// Scrolling this far with the chat open closes it.
const CLOSE_SCROLL_PX = 60
// Ignore scrolls right after opening (focus and mobile keyboards nudge the page).
const OPEN_GRACE_MS = 350
// Ignore scrolls while the mobile keyboard slides in or out after the input gains/loses focus.
const KEYBOARD_GRACE_MS = 800
const LAUNCHER_ID = 'cv-chat-launcher'

interface LauncherButtonProps {
  open: boolean
  onToggle: () => void
  buttonRef?: React.Ref<HTMLButtonElement>
}

function LauncherButton({ open, onToggle, buttonRef }: LauncherButtonProps) {
  return (
    <motion.button
      ref={buttonRef}
      layoutId={LAUNCHER_ID}
      type="button"
      onClick={onToggle}
      aria-label={open ? 'Close my AI assistant' : 'Ask my AI assistant'}
      aria-expanded={open}
      title="Ask my AI assistant"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      className="relative grid h-14 w-14 place-items-center rounded-2xl border bg-card text-foreground shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      {open ? <X className="h-6 w-6" /> : <BotMessageSquare className="h-6 w-6" strokeWidth={1.75} />}
      {!open && (
        <span aria-hidden="true" className="absolute top-2.5 right-2.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-assistant opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-assistant" />
        </span>
      )}
    </motion.button>
  )
}

interface ChatLauncherProps {
  /** Positions the docked tile inside the hero. */
  className?: string
}

/**
 * The chat tile. It sits in the hero until the hero scrolls away, then glides
 * to the bottom-right corner and follows the page. Pressing it opens the chat;
 * scrolling the page closes it again.
 */
export function ChatLauncher({ className }: ChatLauncherProps) {
  const { isOpen: open, setOpen } = useCvChat()
  const slotRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [docked, setDocked] = React.useState(true)

  React.useEffect(() => {
    const slot = slotRef.current
    if (!slot) return
    const observer = new IntersectionObserver(([entry]) => setDocked(entry.isIntersecting), {
      // Treat the tile as gone once it slides under the fixed nav.
      rootMargin: '-80px 0px 0px 0px',
    })
    observer.observe(slot)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!open) return
    let startY = window.scrollY
    let ignoreUntil = performance.now() + OPEN_GRACE_MS

    function onScroll() {
      // While typing, the keyboard (not the user) moves the page: re-anchor instead of closing.
      if (performance.now() < ignoreUntil || document.activeElement === inputRef.current) {
        startY = window.scrollY
        return
      }
      if (Math.abs(window.scrollY - startY) > CLOSE_SCROLL_PX) setOpen(false)
    }
    function onInputFocusChange(e: FocusEvent) {
      if (e.target === inputRef.current) ignoreUntil = performance.now() + KEYBOARD_GRACE_MS
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onInputFocusChange)
    document.addEventListener('focusout', onInputFocusChange)
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onInputFocusChange)
      document.removeEventListener('focusout', onInputFocusChange)
    }
  }, [open, setOpen])

  const toggle = () => setOpen((v) => !v)

  return (
    <>
      <div ref={slotRef} className={cn('h-14 w-14', className)}>
        {docked && <LauncherButton open={open} onToggle={toggle} buttonRef={buttonRef} />}
      </div>

      {createPortal(
        <>
          <AnimatePresence>
            {open && (
              <motion.div
                key="panel"
                role="dialog"
                aria-label="AI assistant chat"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom right' }}
                className="fixed right-4 bottom-22 z-50 w-[min(380px,calc(100vw-2rem))] sm:right-6 sm:bottom-24"
              >
                <CvChatPanel
                  inputRef={inputRef}
                  // Keep wheel scrolling inside the chat: a page scroll would close it.
                  listClassName="h-[min(380px,50vh)] overscroll-contain"
                  onClose={() => setOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!docked && (
            <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
              <LauncherButton open={open} onToggle={toggle} buttonRef={buttonRef} />
            </div>
          )}
        </>,
        document.body,
      )}
    </>
  )
}
