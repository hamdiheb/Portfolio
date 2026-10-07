# Build from the repo root so the resume can be copied in:
#   docker build -f back/Dockerfile .

FROM node:24-slim AS deps
WORKDIR /app
COPY back/package.json back/package-lock.json ./
# The server runs on CPU on Linux, so drop what it never loads: the browser
# runtime, the macOS/Windows binaries and the CUDA/TensorRT providers (~620 MB).
RUN npm ci --omit=dev \
  && rm -rf node_modules/onnxruntime-web \
  && cd node_modules/onnxruntime-node/bin/napi-v6 \
  && rm -rf darwin win32 linux/x64/libonnxruntime_providers_cuda.so linux/x64/libonnxruntime_providers_tensorrt.so \
  && npm cache clean --force
# Bake the embedding model into the image so startup needs no download.
RUN node -e "import('@huggingface/transformers').then((t) => t.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' }))"
# Extract the resume text now, so the PDF parser never loads on the server.
COPY back/src/resume.js ./src/resume.js
COPY front/src/assets/resume.pdf ./data/resume.pdf
RUN node src/resume.js data/resume.pdf data/resume.txt

FROM node:24-slim
ENV NODE_ENV=production \
    PORT=3001 \
    RESUME_PATH=/app/data/resume.txt
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY back/package.json ./
COPY back/src ./src
COPY --from=deps /app/data/resume.txt ./data/resume.txt

USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then((r) => r.json()).then((b) => process.exit(b.ready ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "src/server.js"]
