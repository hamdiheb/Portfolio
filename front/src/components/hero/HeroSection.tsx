import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'

import profileImg from '@/assets/profile.jpeg'
import { ChatLauncher } from '@/components/chat/ChatLauncher'
import { CvChatPanel } from '@/components/chat/CvChatPanel'
import { useCvChat } from '@/components/chat/CvChatProvider'

// Each topic pill asks the chatbot a starter question.
const TOPICS = [
  { label: 'Experience & Roles', question: 'What roles and experience do you have?' },
  { label: 'Skills & Technologies', question: 'What are your main skills and technologies?' },
  { label: 'Projects & Achievements', question: 'What projects are you most proud of?' },
  { label: 'Education & More', question: 'What is your education, and which languages do you speak?' },
]

function ThatsMe() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-10 -left-6 hidden -rotate-12 sm:block lg:-left-14"
    >
      <span className="font-handwriting text-2xl text-assistant-ink">That&apos;s me!</span>
      <svg viewBox="0 0 60 50" className="ml-10 h-12 w-14 text-assistant-ink">
        <path
          d="M6 4c4 18 16 32 40 38m0 0-11-1m11 1-5-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function HeroSection() {
  const { send, isStreaming } = useCvChat()
  const chatCardRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function focusChat() {
    chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    inputRef.current?.focus({ preventScroll: true })
  }

  function askTopic(question: string) {
    if (isStreaming) return
    send(question)
    chatCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <section id="home" className="relative overflow-hidden px-4 pt-28 pb-20 text-left sm:pt-32 lg:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-20%] h-[720px] w-[720px] rounded-full bg-[radial-gradient(closest-side,var(--assistant-glow),transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-assistant-soft px-4 py-2 text-sm font-medium text-assistant-ink">
            <Sparkles className="h-4 w-4" />
            Ask my CV chatbot
          </span>

          {/* `!` beats the unlayered h1/p rules in index.css. */}
          <h1 className="mt-6! mb-0! text-4xl! leading-[1.1]! font-bold! tracking-tight! sm:text-5xl! xl:text-[56px]!">
            Have a question about my background?{' '}
            <span className="block bg-gradient-to-r from-violet-500 via-assistant to-sky-500 bg-clip-text text-transparent">
              Just ask my chatbot!
            </span>
          </h1>

          <p className="mt-6! max-w-lg text-lg text-muted-foreground">
            My AI assistant can answer questions about my experience, skills, projects, education and
            more — just like I would.
          </p>

          <ul className="mt-8 flex max-w-lg flex-wrap gap-3">
            {TOPICS.map((topic) => (
              <li key={topic.label}>
                <button
                  type="button"
                  onClick={() => askTopic(topic.question)}
                  disabled={isStreaming}
                  className="inline-flex items-center gap-2.5 rounded-full bg-assistant-soft py-2.5 pr-4 pl-3 text-sm font-medium text-foreground transition-colors hover:bg-assistant/20 disabled:cursor-wait"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-assistant text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {topic.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col items-center gap-12 lg:block lg:h-[560px]">
          <div className="relative mt-10 lg:absolute lg:top-24 lg:left-0 lg:mt-0">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[48%_52%_44%_56%/55%_45%_55%_45%] bg-gradient-to-br from-sky-300/40 to-assistant/30"
            />
            <img
              src={profileImg}
              alt="Iheb Hamdi"
              className="relative h-[340px] w-[290px] rounded-[2.5rem] object-cover object-top shadow-xl"
            />
            <ThatsMe />
            <ChatLauncher onDockedPress={focusChat} className="absolute -bottom-8 -left-8" />
          </div>

          <div ref={chatCardRef} className="w-full max-w-[360px] scroll-mt-28 lg:absolute lg:top-0 lg:right-0">
            <CvChatPanel inputRef={inputRef} listClassName="h-[340px]" />
          </div>
        </div>
      </div>
    </section>
  )
}
