import { Embeddings } from '@langchain/core/embeddings'
import { pipeline } from '@huggingface/transformers'

/**
 * Sentence embeddings computed in-process with Transformers.js, so the server
 * needs no Ollama or embedding API. all-MiniLM-L6-v2 (quantised) uses ~200 MB
 * of RAM and embeds a question in milliseconds on CPU.
 */
export class LocalEmbeddings extends Embeddings {
  constructor(model) {
    super({})
    this.model = model
    this.extractor = null
  }

  async #getExtractor() {
    this.extractor ??= pipeline('feature-extraction', this.model, { dtype: 'q8' }).catch((err) => {
      this.extractor = null
      throw err
    })
    return this.extractor
  }

  async embedDocuments(texts) {
    const extract = await this.#getExtractor()
    const output = await extract(texts, { pooling: 'mean', normalize: true })
    return output.tolist()
  }

  async embedQuery(text) {
    const [vector] = await this.embedDocuments([text])
    return vector
  }
}
