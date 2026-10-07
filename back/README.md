# CV chatbot backend

Express API that answers questions about my CV with RAG. LangChain splits `resume.pdf` into
chunks, embeds them in-process with Transformers.js (`all-MiniLM-L6-v2`) into an in-memory
vector store, retrieves the most relevant ones per question, and a chat model answers from them:

- **Groq** (hosted, free tier, ~1 s answers) — use this in production and on small servers.
- **Ollama** (fully local) — fine for development if your machine has a GPU; slow on CPU.

## Run locally

```bash
cp .env.example .env      # add GROQ_API_KEY, or set LLM_PROVIDER=ollama
npm install
npm run dev               # http://localhost:3001
```

The front end's Vite dev server proxies `/api` here, so start both and open http://localhost:5173.
The resume is indexed at startup; restart after replacing `front/src/assets/resume.pdf`.

## API

- `GET /api/health` → `{ status, ready, provider, model }`
- `POST /api/chat` `{ message, history?: [{ role: 'user' | 'bot', content }] }` → streamed plain text

## Deploy with Docker (e.g. Google Cloud e2-micro, 1 GB RAM)

`docker-compose.yml` at the repo root runs two containers: this API (Groq for answers, ~400 MB
RAM) and Caddy in front of it, which gets and renews the HTTPS certificate automatically.
A site served over HTTPS can only call an HTTPS API, so the API needs its own domain.

1. **DNS:** point a subdomain (e.g. `api.your-site.com`) at the VM's external IP, and allow
   HTTP/HTTPS traffic on the VM (GCP: *Edit VM → Firewalls → Allow HTTP/HTTPS*).
2. **Swap** — gives a 1 GB VM headroom while building the image:
   ```bash
   sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
3. **Install Docker** with the compose plugin: https://docs.docker.com/engine/install/
4. **Configure and start** from the repo root:
   ```bash
   cp .env.example .env            # API_DOMAIN=api.your-site.com
   cp back/.env.example back/.env  # GROQ_API_KEY=..., ALLOWED_ORIGINS=https://your-site.com
   docker compose up -d --build
   curl https://api.your-site.com/api/health
   ```
5. **Front end on Vercel:** import the repo, then in the project settings:
   - **Root Directory:** `front` (Vercel detects Vite and runs `npm run build`)
   - **Environment variable:** `VITE_API_URL=https://api.your-site.com` for Production and
     Preview. It's read at build time, so redeploy after changing it.
   - Back on the VM, list the Vercel URLs in `back/.env` and restart with
     `docker compose up -d`:
     ```
     ALLOWED_ORIGINS=https://your-project.vercel.app,https://your-project-*.vercel.app
     ```
     The second entry covers preview deployments; add your custom domain if you use one.

After changing the resume or code: `git pull && docker compose up -d --build`.
Logs: `docker compose logs -f api`.
