import { readFile, writeFile } from 'node:fs/promises'

/**
 * The resume as plain text. A `.txt` path is read as-is; a PDF is parsed.
 * The Docker image extracts the text at build time (see bottom of this file)
 * so the ~60 MB PDF parser never loads on the server.
 */
export async function loadResumeText(filePath) {
  if (filePath.endsWith('.txt')) return readFile(filePath, 'utf8')

  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: await readFile(filePath) })
  try {
    const { text } = await parser.getText()
    return text
  } finally {
    await parser.destroy()
  }
}

// node src/resume.js <in.pdf> <out.txt>
if (import.meta.main) {
  const [input, output] = process.argv.slice(2)
  await writeFile(output, await loadResumeText(input))
  console.log(`[resume] extracted ${input} -> ${output}`)
}
