import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Check, Loader2, MapPin } from 'lucide-react'

import resumeUrl from '@/assets/resume.pdf'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { sendContact } from './contactApi'
import { EMAIL, SOCIAL_LINKS } from './socials'

const EASE = [0.22, 1, 0.36, 1] as const

// Same limits as the API (back/src/contact.js).
const LIMITS = { name: 100, email: 200, messageMin: 10, messageMax: 5000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = 'name' | 'email' | 'message'
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>

type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent' }
  /** `fallback`: offer the visitor a direct email link instead. */
  | { state: 'error'; message: string; fallback: boolean }

const EMPTY: Values = { name: '', email: '', message: '' }

function validate(values: Values): Errors {
  const errors: Errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (!name) errors.name = 'Please tell me your name.'
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`

  if (!email) errors.email = 'I need an email address to reply to.'
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email))
    errors.email = 'That email address doesn’t look right.'

  if (!message) errors.message = 'Write a short message.'
  else if (message.length < LIMITS.messageMin)
    errors.message = `A little more detail, please — at least ${LIMITS.messageMin} characters.`
  else if (message.length > LIMITS.messageMax)
    errors.message = `Keep it under ${LIMITS.messageMax} characters.`

  return errors
}

/** A mailto link carrying what the visitor already typed. */
function mailtoFor(values: Values) {
  const subject = values.name.trim() ? `Hello from ${values.name.trim()}` : 'Hello'
  const body = values.message.trim().slice(0, 1500)
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`
}

/** Fades in once, when scrolled into view. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

const fieldClass =
  'h-12 rounded-xl px-4 text-base shadow-none transition-colors sm:text-sm focus-visible:ring-offset-0 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/40'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2! text-sm text-destructive">
      {message}
    </p>
  )
}

function ContactForm() {
  const [values, setValues] = React.useState<Values>(EMPTY)
  const [errors, setErrors] = React.useState<Errors>({})
  // Errors appear on submit, then update live as the visitor fixes them.
  const [submitted, setSubmitted] = React.useState(false)
  const [status, setStatus] = React.useState<Status>({ state: 'idle' })
  const honeypot = React.useRef<HTMLInputElement>(null)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const emailRef = React.useRef<HTMLInputElement>(null)
  const messageRef = React.useRef<HTMLTextAreaElement>(null)
  const successRef = React.useRef<HTMLDivElement>(null)
  const sending = status.state === 'sending'

  function update(field: Field) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = { ...values, [field]: e.target.value }
      setValues(next)
      if (submitted) setErrors(validate(next))
      if (status.state === 'error') setStatus({ state: 'idle' })
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return
    setSubmitted(true)
    const found = validate(values)
    setErrors(found)
    const first = (['name', 'email', 'message'] as const).find((f) => found[f])
    if (first) {
      const fieldRefs = { name: nameRef, email: emailRef, message: messageRef }
      fieldRefs[first].current?.focus()
      return
    }

    setStatus({ state: 'sending' })
    const result = await sendContact({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      website: honeypot.current?.value ?? '',
    })
    if (result.ok) {
      setStatus({ state: 'sent' })
      requestAnimationFrame(() => successRef.current?.focus())
    } else {
      setStatus({ state: 'error', message: result.error, fallback: result.kind === 'unavailable' })
    }
  }

  function reset() {
    setValues(EMPTY)
    setErrors({})
    setSubmitted(false)
    setStatus({ state: 'idle' })
    requestAnimationFrame(() => nameRef.current?.focus())
  }

  if (status.state === 'sent') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex min-h-[26rem] flex-col items-start justify-center outline-none"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-assistant-soft text-assistant-ink">
          <Check className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Message sent.
        </h3>
        <p className="mt-3! max-w-sm text-muted-foreground">
          Thanks, {values.name.trim().split(/\s+/)[0]} — I’ll get back to you at{' '}
          <span className="font-medium [overflow-wrap:anywhere] text-foreground">{values.email.trim()}</span> soon.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Send another message
        </button>
      </div>
    )
  }

  const messageLength = values.message.trim().length

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Contact form" className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            ref={nameRef}
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={update('name')}
            maxLength={LIMITS.name + 20}
            disabled={sending}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            className={cn(fieldClass, 'mt-2')}
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            ref={emailRef}
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={update('email')}
            maxLength={LIMITS.email + 20}
            disabled={sending}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={cn(fieldClass, 'mt-2')}
          />
          <FieldError id="contact-email-error" message={errors.email} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="contact-message">Message</Label>
          <span
            className={cn(
              'text-xs tabular-nums text-muted-foreground',
              messageLength > LIMITS.messageMax && 'text-destructive',
            )}
            aria-hidden="true"
          >
            {messageLength}/{LIMITS.messageMax}
          </span>
        </div>
        <Textarea
          ref={messageRef}
          id="contact-message"
          name="message"
          placeholder="A role, a project, or just a hello — tell me a bit about it."
          rows={6}
          value={values.message}
          onChange={update('message')}
          disabled={sending}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={cn(fieldClass, 'mt-2 h-auto min-h-40 resize-y py-3 leading-relaxed')}
        />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input ref={honeypot} id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite">
        {status.state === 'error' && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
          >
            <p className="m-0! font-medium">{status.message}</p>
            {status.fallback && (
              <p className="mt-1! text-muted-foreground">
                You can email me directly at{' '}
                <a
                  href={mailtoFor(values)}
                  className="font-medium whitespace-nowrap text-foreground underline underline-offset-4"
                >
                  {EMAIL}
                </a>{' '}
                — your message will be pre-filled.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0! text-xs text-muted-foreground">
          Your details are only used to reply to you.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[transform,opacity] hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-20 overflow-x-clip px-4 py-20 text-left sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Contact
          </p>
          {/* `!` beats the unlayered h1/h2/p rules in index.css. */}
          <h2
            id="contact-heading"
            className="mt-3! mb-0! text-[clamp(2.75rem,8vw,6rem)]! leading-[0.95]! font-black! tracking-[-0.045em]! text-foreground!"
          >
            Let’s work
            <br />
            together.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-[1fr_1.25fr] md:gap-12 lg:gap-20">
          <Reveal delay={0.1} className="min-w-0">
            <p className="m-0! max-w-sm text-muted-foreground sm:text-lg">
              Have a role, a project or an idea? Send me a message — or reach me on any of these.
            </p>

            <ul className="mt-8 list-none border-t p-0">
              {SOCIAL_LINKS.map(({ label, value, href, icon: Icon }) => {
                const external = href.startsWith('http')
                return (
                  <li key={label} className="border-b">
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="group flex min-h-16 items-center gap-4 py-3 text-foreground"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:bg-foreground group-hover:text-background">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-muted-foreground">{label}</span>
                        <span className="block truncate font-medium">{value}</span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                        aria-hidden="true"
                      />
                      {external && <span className="sr-only">(opens in a new tab)</span>}
                    </a>
                  </li>
                )
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href={resumeUrl}
                download="Iheb-Hamdi-CV.pdf"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                Download CV
              </a>
              <p className="m-0! inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Based in Barcelona, Spain
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="min-w-0">
            <div className="relative rounded-3xl border bg-card p-5 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
