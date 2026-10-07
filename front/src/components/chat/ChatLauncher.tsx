import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CvChatPanel } from './CvChatPanel'

// Scrolling this far with the floating chat open closes it.
const CLOSE_SCROLL_PX = 60
// Ignore scrolls right after opening (focus and mobile keyboards nudge the page).
const OPEN_GRACE_MS = 350
const LAUNCHER_ID = 'cv-chat-launcher'

const tileClass =
  'grid place-items-center bg-gradient-to-br from-sky-400 via-assistant to-fuchsia-500 text-white shadow-[0_18px_40px_-12px_rgba(79,70,229,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-assistant'

interface ChatLauncherProps {
  /** Pressed while docked in the hero, where the full chat card is already on screen. */
  onDockedPress: () => void
  /** Positions the docked tile inside the hero. */
  className?: string
}

/**
 * The robot tile. It sits in the hero until the hero scrolls away, then flies
 * to the bottom-right corner and follows the page. There, pressing it opens
 * the chat; scrolling the page closes it again.
 */
export function ChatLauncher({ onDockedPress, className }: ChatLauncherProps) {
  const slotRef = React.useRef<HTMLDivElement>(null)
  const floatingButtonRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [docked, setDocked] = React.useState(true)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const slot = slotRef.current
    if (!slot) return
    const observer = new IntersectionObserver(([entry]) => {
      setDocked(entry.isIntersecting)
      // Back in the hero, the full chat card is on screen; the popup isn't needed.
      if (entry.isIntersecting) setOpen(false)
    }, {
      // Treat the tile as gone once it slides under the fixed nav.
      rootMargin: '-80px 0px 0px 0px',
    })
    observer.observe(slot)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!open) return
    const startY = window.scrollY
    const openedAt = performance.now()

    function onScroll() {
      if (performance.now() - openedAt < OPEN_GRACE_MS) return
      if (Math.abs(window.scrollY - startY) > CLOSE_SCROLL_PX) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        floatingButtonRef.current?.focus()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <div ref={slotRef} className={cn('h-24 w-24', className)}>
        {docked && (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 40 40"
              className="pointer-events-none absolute -top-7 -left-7 h-10 w-10 text-assistant"
            >
              <path d="M30 10 26 3M20 17 8 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <motion.button
              layoutId={LAUNCHER_ID}
              type="button"
              onClick={onDockedPress}
              aria-label="Ask my CV chatbot"
              initial={false}
              animate={{ rotate: -6 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(tileClass, 'h-24 w-24 rounded-[28px]')}
            >
              <Bot className="h-12 w-12" strokeWidth={1.75} />
            </motion.button>
          </>
        )}
      </div>

      {createPortal(
        <>
          <AnimatePresence>
            {open && (
              <motion.div
                key="panel"
                role="dialog"
                aria-label="CV chatbot"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom right' }}
                className="fixed right-4 bottom-24 z-50 w-[min(380px,calc(100vw-2rem))] sm:right-6 sm:bottom-28"
              >
                <CvChatPanel
                  inputRef={inputRef}
                  listClassName="h-[min(380px,50vh)]"
                  onClose={() => setOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!docked && (
            <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
              <motion.button
                ref={floatingButtonRef}
                layoutId={LAUNCHER_ID}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close CV chatbot' : 'Ask my CV chatbot'}
                aria-expanded={open}
                title="Ask my CV chatbot"
                initial={false}
                animate={{ rotate: 0 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={cn(tileClass, 'h-16 w-16 rounded-2xl')}
              >
                {open ? <X className="h-7 w-7" /> : <Bot className="h-8 w-8" strokeWidth={1.75} />}
              </motion.button>
            </div>
          )}
        </>,
        document.body,
      )}
    </>
  )
}
