import { config } from './config.js'

const LIMITS = { name: 100, email: 200, messageMin: 10, messageMax: 5000 }
// Deliberately simple: one "@", no spaces, a dot in the domain. The reply is what really verifies it.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Strip control characters (incl. CR/LF, which could inject email headers) from one-line fields.
const oneLine = (s) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()
// Keep newlines and tabs in the message, drop other control characters.
const multiLine = (s) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim()

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/**
 * Validates a contact form body.
 * Returns { spam: true } for a filled honeypot, { error } when invalid, or { name, email, message }.
 */
export function parseContact(body) {
  // Bots fill every field; people never see this one.
  if (typeof body?.website === 'string' && body.website.trim()) return { spam: true }

  const name = typeof body?.name === 'string' ? oneLine(body.name) : ''
  const email = typeof body?.email === 'string' ? oneLine(body.email) : ''
  const message = typeof body?.message === 'string' ? multiLine(body.message) : ''

  if (!name || name.length > LIMITS.name) {
    return { error: `Please enter your name (up to ${LIMITS.name} characters).` }
  }
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) {
    return {
      error: `Your message should be between ${LIMITS.messageMin} and ${LIMITS.messageMax} characters.`,
    }
  }
  return { name, email, message }
}

export const isMailConfigured = () =>
  Boolean(config.smtp.host && config.smtp.user && config.smtp.pass && config.smtp.to)

let transporterPromise
// nodemailer is only loaded on the first message, so it costs no memory until someone writes.
function getTransporter() {
  transporterPromise ??= import('nodemailer')
    .then(({ default: nodemailer }) =>
      nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        // Port 465 uses TLS from the start; 587 upgrades with STARTTLS.
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      }),
    )
    .catch((err) => {
      transporterPromise = undefined
      throw err
    })
  return transporterPromise
}

export async function sendContactEmail({ name, email, message }) {
  const transporter = await getTransporter()
  const from = config.smtp.from || config.smtp.user
  const subject = `Portfolio contact from ${name}`.slice(0, 150)

  await transporter.sendMail({
    // The display name is the visitor's, the address stays ours so SPF/DKIM pass.
    from: { name: `${name} (portfolio)`, address: from },
    to: config.smtp.to,
    replyTo: { name, address: email },
    subject,
    text: `From: ${name} <${email}>\n\n${message}\n`,
    html:
      `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>` +
      `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
  })
}
