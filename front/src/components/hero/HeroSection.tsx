import * as React from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowDownToLine, ArrowRight } from 'lucide-react'

import profileImg from '@/assets/profile.jpeg'
import resumeUrl from '@/assets/resume.pdf'
import { ChatLauncher } from '@/components/chat/ChatLauncher'
import { useCvChat } from '@/components/chat/CvChatProvider'

const EASE = [0.22, 1, 0.36, 1] as const

const TRAITS = [
  ['Full-Stack', 'Engineer'],
  ['API & System', 'Designer'],
  ['AI Feature', 'Builder'],
  ['Based in', 'Barcelona, Spain'],
]

/** One line of the name, rising out of a mask. */
function RevealLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduce = useReducedMotion()
  return (
    // A background strip exactly as wide as the word: where the name crosses the
    // phone portrait, the photo stops at the text instead of running behind it.
    <span className="block w-fit overflow-hidden bg-background pr-[0.04em] pb-[0.04em] max-md:mb-[0.1em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function FadeUp({
  children,
  delay,
  className,
}: {
  children: React.ReactNode
  delay: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** A faded copy of the photo trailing behind it, drifting with the pointer. */
function Ghost({
  pointer,
  offset,
  opacity,
  delay,
}: {
  pointer: MotionValue<number>
  offset: number
  opacity: number
  delay: number
}) {
  const reduce = useReducedMotion()
  const drift = useTransform(pointer, (p) => `${p * offset * 0.35}%`)
  return (
    <motion.div className="absolute inset-0" style={{ x: drift }}>
      <motion.img
        src={profileImg}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-top grayscale"
        // Only the ghost's left strip peeks out from behind the photo; fading it
        // keeps the trail soft instead of a hard-edged copy of the backdrop.
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 22%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 22%)',
        }}
        initial={reduce ? false : { x: '0%', opacity: 0 }}
        animate={{ x: `${-offset}%`, opacity }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      />
    </motion.div>
  )
}

/** The grayscale photo with its ghost trail; sized by the parent. */
function PortraitPhoto({
  pointer,
  className,
  alt = '',
}: {
  pointer: MotionValue<number>
  className?: string
  alt?: string
}) {
  const reduce = useReducedMotion()
  return (
    <div className={`relative aspect-[4/5] ${className ?? ''}`}>
      <Ghost pointer={pointer} offset={16} opacity={0.12} delay={0.75} />
      <Ghost pointer={pointer} offset={8} opacity={0.28} delay={0.65} />
      <motion.img
        src={profileImg}
        alt={alt}
        className="relative h-full w-full object-cover object-top grayscale contrast-[1.08]"
        initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
      />
    </div>
  )
}

/**
 * Phones: a portrait behind the right end of the name. Each line of the name
 * and tagline sits on its own background strip, and the photo's left side fades out.
 */
function MobilePortrait() {
  const still = useMotionValue(0)
  return (
    <div
      aria-hidden="true"
      // Exactly as tall as the name and tagline block, so photo and text line up top and bottom;
      // the width follows from the 4:5 ratio.
      className="pointer-events-none absolute top-0 right-0 bottom-0 aspect-[4/5] md:hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 25%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%)',
      }}
    >
      <PortraitPhoto pointer={still} />
    </div>
  )
}

function Portrait() {
  const reduce = useReducedMotion()
  // -1 (pointer at the left edge) … 1 (right edge); the spring keeps the drift soft.
  const raw = useMotionValue(0)
  const pointer = useSpring(raw, { stiffness: 80, damping: 20 })

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    raw.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
  }

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={() => raw.set(0)}
      className="relative ml-auto hidden w-full max-w-[380px] pt-16 pb-16 md:block"
    >
      <FadeUp delay={0.9} className="absolute top-0 right-0 z-10 text-right">
        <p className="text-2xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-3xl">
          Full-Stack
          <br />
          Engineer
        </p>
      </FadeUp>

      <PortraitPhoto pointer={pointer} alt="Portrait of Iheb Hamdi, Full-Stack Engineer in Barcelona" />

      <FadeUp delay={1.05} className="absolute bottom-0 left-0 z-10">
        <p className="text-2xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-3xl">
          AI
          <br />
          Integrations
        </p>
      </FadeUp>
    </div>
  )
}

export function HeroSection() {
  const { setOpen } = useCvChat()
  const reduce = useReducedMotion()

  return (
    <section id="home" className="relative overflow-x-clip px-4 pt-28 pb-14 text-left sm:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.2fr_1fr] md:gap-6">
        <div>
          <div className="relative">
            <MobilePortrait />
            <h1 className="relative z-10 m-0! flex flex-col text-[clamp(3.75rem,11vw,8.5rem)]! leading-[0.92]! font-black! tracking-[-0.045em]! text-foreground!">
              <RevealLine delay={0.1}>Iheb</RevealLine>
              <RevealLine delay={0.22}>Hamdi</RevealLine>
            </h1>

            <FadeUp delay={0.45} className="relative z-10">
              <h2 className="mt-8! mb-0! text-2xl! leading-tight! font-semibold! tracking-tight! text-foreground! sm:text-3xl!">
                {/* One strip per line, each ending where its text ends. Block backgrounds paint
                    before all text, so a strip never covers the line above's descenders. */}
                <span className="block w-fit bg-background px-[2px] max-md:mb-[0.15em]">Building Products</span>
                <span className="block w-fit bg-background px-[2px]">From API to Interface</span>
              </h2>
            </FadeUp>
          </div>

          <FadeUp delay={0.55}>
            <p className="mt-4! max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Full-Stack Engineer based in Barcelona, Spain. I ship production web systems end to
              end — Node.js REST APIs, PostgreSQL data models and React front ends — and build
              AI-powered features without cutting corners.
            </p>
          </FadeUp>

          <FadeUp delay={0.65} className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              Ask my AI assistant
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href={resumeUrl}
              download="Iheb-Hamdi-CV.pdf"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <ArrowDownToLine aria-hidden="true" className="h-4 w-4" />
              Download CV
            </a>
          </FadeUp>
        </div>

        <Portrait />
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl">
        <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-6 border-t p-0 pt-6 sm:grid-cols-4">
          {TRAITS.map(([top, bottom], i) => (
            <motion.li
              key={top}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 1.1 + i * 0.08 }}
              className="text-sm leading-snug font-medium text-foreground"
            >
              {top}
              <br />
              <span className="text-muted-foreground">{bottom}</span>
            </motion.li>
          ))}
        </ul>

        {/* Aligned with the content's right edge; docks here until the hero scrolls away. */}
        <ChatLauncher className="absolute top-full right-0 z-20 mt-7" />
      </div>
    </section>
  )
}
