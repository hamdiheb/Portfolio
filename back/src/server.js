import express from 'express'
import cors from 'cors'

import { chatModelName, config } from './config.js'
import { answer, isReady, warmUp } from './rag.js'

const MAX_QUESTION_LENGTH = 500
const MAX_HISTORY = 8
const MAX_HISTORY_ITEM_LENGTH = 2000
const RATE_LIMIT = { windowMs: 60_000, max: 20 }

const app = express()
// Read the visitor's IP from X-Forwarded-For when behind a reverse proxy.
app.set('trust proxy', config.trustProxy)
app.use(cors({ origin: config.allowedOrigins }))
app.use(express.json({ limit: '32kb' }))

// Small per-IP limiter: a local model is slow, so a burst could queue minutes of work.
const hits = new Map()
function rateLimit(req, res, next) {
  const now = Date.now()
  const entry = hits.get(req.ip)
  if (!entry || now - entry.start > RATE_LIMIT.windowMs) {
    hits.set(req.ip, { start: now, count: 1 })
    return next()
  }
  if (++entry.count > RATE_LIMIT.max) {
    return res.status(429).json({ error: 'Too many questions — please wait a minute.' })
  }
  next()
}

function parseBody(body) {
  const question = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!question || question.length > MAX_QUESTION_LENGTH) return null

  const rawHistory = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : []
  const history = rawHistory
    .filter(
      (m) =>
        (m?.role === 'user' || m?.role === 'bot') &&
        typeof m.content === 'string' &&
        m.content.trim(),
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_ITEM_LENGTH) }))

  return { question, history }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ready: isReady(), provider: config.llmProvider, model: chatModelName })
})

app.post('/api/chat', rateLimit, async (req, res) => {
  const input = parseBody(req.body)
  if (!input) {
    return res
      .status(400)
      .json({ error: `Send a "message" between 1 and ${MAX_QUESTION_LENGTH} characters.` })
  }

  // Stop generating if the visitor closes the chat mid-answer.
  const controller = new AbortController()
  res.on('close', () => controller.abort())

  try {
    const stream = answer(input.question, input.history, controller.signal)
    for await (const chunk of stream) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
      }
      res.write(chunk)
    }
    res.end()
  } catch (err) {
    if (controller.signal.aborted) return
    console.error('[chat]', err)
    if (!res.headersSent) {
      res.status(503).json({ error: 'The assistant is offline right now. Please try again later.' })
    } else {
      res.end()
    }
  }
})

app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port} (${config.llmProvider}: ${chatModelName})`)
  warmUp().catch((err) =>
    console.warn(`[rag] warm-up failed (${err.message}); will retry on the first question`),
  )
})
