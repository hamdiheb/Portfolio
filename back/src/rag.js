import { Document } from '@langchain/core/documents'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'

import { config } from './config.js'
import { LocalEmbeddings } from './embeddings.js'
import { loadResumeText } from './resume.js'

const SYSTEM_PROMPT = `You are the CV assistant on Iheb Hamdi's portfolio website.
Answer visitors' questions about Iheb in the first person, the way Iheb would ("I work with...", "My latest project...").

Rules:
- Use ONLY the facts in the CV excerpts below. Never invent employers, dates, numbers, links or skills.
- If the excerpts don't contain the answer, say that detail isn't in my CV and suggest reaching out via the contact details on the site. Don't guess about what the rest of the CV does or doesn't contain.
- Keep answers short and friendly: 2-5 sentences, or a brief list when listing several items.
- Plain text only. No markdown headings, tables or bold.
- If a question has nothing to do with Iheb's background or work, politely steer back to it.

CV excerpts:
{context}`

const prompt = ChatPromptTemplate.fromMessages([
  ['system', SYSTEM_PROMPT],
  new MessagesPlaceholder('history'),
  ['human', '{question}'],
])

// Import only the provider in use; each SDK costs memory on a small server.
async function createLlm() {
  if (config.llmProvider === 'groq') {
    const { ChatGroq } = await import('@langchain/groq')
    return new ChatGroq({ apiKey: config.groqApiKey, model: config.groqModel, temperature: 0.2 })
  }
  const { ChatOllama } = await import('@langchain/ollama')
  return new ChatOllama({
    baseUrl: config.ollamaBaseUrl,
    model: config.ollamaModel,
    temperature: 0.2,
    keepAlive: config.keepAlive,
  })
}

const embeddings = new LocalEmbeddings(config.embedModel)

const chain = prompt.pipe(await createLlm()).pipe(new StringOutputParser())

async function buildRetriever() {
  const text = await loadResumeText(config.resumePath)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 120,
  })
  const chunks = await splitter.splitDocuments([
    new Document({ pageContent: text, metadata: { source: 'resume.pdf' } }),
  ])
  const store = await MemoryVectorStore.fromDocuments(chunks, embeddings)
  console.log(`[rag] indexed ${chunks.length} chunks from ${config.resumePath}`)
  return store.asRetriever({ k: config.topK })
}

// Built once and shared; reset on failure so a transient error can recover.
let retrieverPromise = null
export function getRetriever() {
  retrieverPromise ??= buildRetriever().catch((err) => {
    retrieverPromise = null
    throw err
  })
  return retrieverPromise
}

let ready = false
export const isReady = () => ready

// Loading a local model into memory can take a minute; do it at boot, not on the first visitor's question.
async function preloadChatModel() {
  if (config.llmProvider !== 'ollama') return
  const res = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.ollamaModel, keep_alive: config.keepAlive }),
  })
  if (!res.ok) throw new Error(`Ollama could not load ${config.ollamaModel} (HTTP ${res.status})`)
}

export async function warmUp() {
  await Promise.all([getRetriever(), preloadChatModel()])
  ready = true
}

/**
 * Streams an answer grounded in the CV.
 * `history` is the prior conversation as [{ role: 'user' | 'bot', content }].
 */
export async function* answer(question, history, signal) {
  const retriever = await getRetriever()
  ready = true

  // Follow-ups like "and before that?" retrieve poorly on their own,
  // so search with the previous user turn as extra context.
  const lastUserTurn = [...history].reverse().find((m) => m.role === 'user')
  const searchQuery = lastUserTurn ? `${lastUserTurn.content}\n${question}` : question
  const docs = await retriever.invoke(searchQuery)
  const context = docs.map((d) => d.pageContent).join('\n---\n')

  const messages = history.map((m) =>
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
  )

  const stream = await chain.stream({ context, history: messages, question }, { signal })
  for await (const chunk of stream) yield chunk
}
