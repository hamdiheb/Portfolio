import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const ROTATING_WORDS = ['my experience', 'my projects', 'my skills', 'me']
const ROTATE_INTERVAL_MS = 2200

function SwappingWord() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-[var(--brand-accent)]"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const SCATTERED_CARDS = [
  {
    className:
      'hidden sm:block absolute -left-4 top-6 h-28 w-24 -rotate-[10deg] bg-gradient-to-br from-[var(--brand-accent)] to-pink-400',
  },
  {
    className:
      'hidden sm:block absolute -right-6 top-0 h-24 w-20 rotate-[12deg] bg-gradient-to-br from-sky-400 to-cyan-200',
  },
  {
    className:
      'hidden md:block absolute left-16 -bottom-4 h-28 w-24 rotate-[7deg] bg-gradient-to-br from-amber-300 to-orange-500',
  },
  {
    className:
      'hidden md:block absolute right-10 bottom-0 h-24 w-24 -rotate-[9deg] bg-gradient-to-br from-violet-400 to-fuchsia-300',
  },
]

interface HeroSectionProps {
  onOpenChat: () => void
}

export function HeroSection({ onOpenChat }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-24 sm:pt-40">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        {SCATTERED_CARDS.map((card, i) => (
          <a
            key={i}
            href="#"
            onClick={(e) => e.preventDefault()}
            aria-hidden="true"
            tabIndex={-1}
            className={cn(
              'rounded-3xl shadow-lg transition-transform duration-300 hover:scale-105',
              card.className,
            )}
          />
        ))}

        <h1 className="relative text-4xl font-bold leading-tight sm:text-6xl">
          Ask my chatbot about
          <br />
          <SwappingWord />
        </h1>

        <p className="relative mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
          A small assistant grounded in my CV — ask about my background,
          skills, or projects.
        </p>

        <button
          type="button"
          onClick={onOpenChat}
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
          Chat with me
        </button>
      </div>
    </section>
  )
}
