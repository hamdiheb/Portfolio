import { ProjectShowcase, type Project } from '@/components/ui/project-showcase'

// Mirrors the Projects section of the CV (src/assets/resume.pdf).
const PROJECTS: Project[] = [
  {
    id: 'ab-auto-centre',
    name: 'AB Auto Centre',
    description:
      'Booking site for a Québec auto repair shop, synced both ways with the garage’s GEM-CAR system: live availability in, confirmed bookings written back as work orders.',
    year: '2026',
    role: 'Freelance',
    tags: ['React 19', 'Express 5', 'Supabase / Postgres', 'Vercel', 'Render'],
    gradientClassName: 'bg-gradient-to-br from-zinc-900 via-zinc-700 to-amber-500',
  },
  {
    id: 'pikpilot',
    name: 'PikPilot',
    description:
      'AI-powered movie discovery: plain-language requests become film recommendations from an LLM, each one verified against the TMDB API.',
    year: '2026',
    role: 'Solo',
    href: 'https://pikpilot.netlify.app',
    repoHref: 'https://github.com/hamdiheb/PIKPILOT',
    tags: ['React 19', 'Express 5', 'OpenRouter', 'TMDB API', 'GSAP'],
    gradientClassName: 'bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300',
  },
  {
    id: 'guesswho',
    name: 'GuessWho',
    description:
      'Full-stack multiplayer social game with an AI question generator, built with a 3-person team through a branch-per-feature, peer-reviewed Git flow.',
    year: '2026',
    role: 'Team of 3',
    href: 'https://guesswhomigracode.netlify.app',
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
