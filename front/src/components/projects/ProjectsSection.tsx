import { ProjectShowcase, type Project } from '@/components/ui/project-showcase'
import shiftTechShot from '@/assets/projects/shift-tech.webp'
import jobbyShot from '@/assets/projects/jobby.webp'
import abAutoShot from '@/assets/projects/ab-auto-centre.webp'
import pikpilotShot from '@/assets/projects/pikpilot.webp'
import guesswhoShot from '@/assets/projects/guesswho.webp'

// Hover previews are screenshots of each live site (src/assets/projects).
// Mirrors the Projects section of the CV (src/assets/resume.pdf), plus Shift Tech and Jobby
// (newer than the CV). Newest first.
const PROJECTS: Project[] = [
  {
    id: 'shift-tech',
    image: shiftTechShot,
    name: 'Shift Tech Innovation',
    description:
      'Website for an AI-process-driven cloud architecture firm and authorized Google Solutions Reseller: English, Spanish and Portuguese with language auto-detected from the visitor’s time zone, and a two-step consultation form that lands in WhatsApp.',
    year: '2026',
    role: 'Freelance',
    href: 'https://www.shifttechinnovation.com/',
    tags: ['React', 'Vite', 'Tailwind CSS', 'Motion', 'i18n (EN / ES / PT)'],
    gradientClassName: 'bg-gradient-to-br from-blue-500 via-emerald-400 to-yellow-300',
  },
  {
    id: 'jobby',
    image: jobbyShot,
    name: 'Jobby',
    description:
      'Six remote job boards in one tab: searches RemoteOK, Arbeitnow, Remotive, Jobicy, We Work Remotely and Adzuna at once, tracks your applications, and uses an AI model via the OpenRouter gateway to find companies near you.',
    year: '2026',
    role: 'Solo',
    href: 'https://jobby-lac-chi.vercel.app/',
    tags: ['PostgreSQL', 'Auth from scratch', 'Cloudflare R2', 'Docker', 'Google Cloud', 'OpenRouter'],
    gradientClassName: 'bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600',
  },
  {
    id: 'ab-auto-centre',
    image: abAutoShot,
    name: 'AB Auto Centre',
    description:
      'Booking site for a Québec auto repair shop, synced both ways with the garage’s GEM-CAR system: live availability in, confirmed bookings written back as work orders.',
    year: '2026',
    role: 'Freelance',
    href: 'https://www.abautocentre.com/',
    tags: ['React 19', 'Express 5', 'Supabase / Postgres', 'Vercel', 'Render'],
    gradientClassName: 'bg-gradient-to-br from-zinc-900 via-zinc-700 to-amber-500',
  },
  {
    id: 'pikpilot',
    image: pikpilotShot,
    name: 'PikPilot',
    description:
      'AI-powered movie discovery: plain-language requests become film recommendations from an LLM, each one verified against the TMDB API.',
    year: '2026',
    role: 'Solo',
    href: 'https://pikpilot.netlify.app/',
    repoHref: 'https://github.com/hamdiheb/PIKPILOT',
    tags: ['React 19', 'Express 5', 'OpenRouter', 'TMDB API', 'GSAP'],
    gradientClassName: 'bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300',
  },
  {
    id: 'guesswho',
    image: guesswhoShot,
    name: 'GuessWho',
    description:
      'Full-stack multiplayer social game with an AI question generator, built with a 3-person team through a branch-per-feature, peer-reviewed Git flow.',
    year: '2026',
    role: 'Team of 3',
    href: 'https://guesswhomigracode.netlify.app/',
    repoHref: 'https://github.com/hamdiheb/GuessWhoProject',
    tags: ['React 19', 'Express 5', 'PostgreSQL (Supabase)', 'OpenRouter'],
    gradientClassName: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-700',
  },
]

export function ProjectsSection() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative px-4 py-20 text-left sm:py-24"
    >
      {/* Same content width as the hero, so section edges line up. */}
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Selected Work
          </p>
          <h2
            id="projects-heading"
            className="mt-2! mb-0! text-3xl! font-bold! tracking-tight! text-foreground! sm:text-4xl!"
          >
            Things I&apos;ve built
          </h2>
          <p className="mt-3! max-w-2xl text-muted-foreground">
            Full-stack products I&apos;ve designed and shipped end to end — React front ends,
            Node.js and Express APIs, PostgreSQL data and AI integrations.
          </p>
        </div>

        <ProjectShowcase projects={PROJECTS} />
      </div>
    </section>
  )
}
