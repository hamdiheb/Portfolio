import path from 'node:path'

const here = import.meta.dirname

// "*" matches one DNS label, so https://porfolio-*.vercel.app covers Vercel preview URLs.
const toOriginMatcher = (origin) =>
  origin.includes('*')
    ? new RegExp(`^${origin.split('*').map((p) => p.replace(/[.?+^$()[\]{}|\\/]/g, '\\$&')).join('[a-z0-9-]+')}$`)
    : origin

export const config = {
  port: Number(process.env.PORT ?? 3001),
  // Comma-separated list of front-end origins allowed to call the API.
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .map(toOriginMatcher),
  // "groq" (hosted, fast — use on small servers) or "ollama" (fully local).
  llmProvider: process.env.LLM_PROVIDER ?? (process.env.GROQ_API_KEY ? 'groq' : 'ollama'),
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? process.env.CHAT_MODEL ?? 'llama3',
  // How long Ollama keeps the chat model in memory between questions.
  keepAlive: process.env.OLLAMA_KEEP_ALIVE ?? '30m',
  embedModel: process.env.EMBED_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
  // The front end already ships the resume, so read that copy by default.
  resumePath: path.resolve(
    here,
    process.env.RESUME_PATH ?? '../../front/src/assets/resume.pdf',
  ),
  topK: Number(process.env.TOP_K ?? 5),
  // Express "trust proxy": a hop count (e.g. 1 behind Caddy in Docker) or a name like "loopback".
  trustProxy: /^\d+$/.test(process.env.TRUST_PROXY ?? '')
    ? Number(process.env.TRUST_PROXY)
    : (process.env.TRUST_PROXY ?? 'loopback'),
}

export const chatModelName =
  config.llmProvider === 'groq' ? config.groqModel : config.ollamaModel
