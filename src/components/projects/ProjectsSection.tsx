import { ProjectShowcase, type Project } from '@/components/ui/project-showcase'

// Placeholder content — swap these out for your real projects.
const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Project One',
    description:
      'Add a description for this project — what it does and why it matters.',
    year: '2024',
    href: '#',
    tags: ['Web App', 'TypeScript'],
    gradientClassName: 'bg-gradient-to-br from-[var(--brand-accent)] to-pink-400',
  },
  {
    id: '2',
    name: 'Project Two',
    description:
      'Add a description for this project — what it does and why it matters.',
    year: '2024',
    href: '#',
    tags: ['API', 'Node.js'],
    gradientClassName: 'bg-gradient-to-br from-sky-400 to-cyan-200',
  },
  {
    id: '3',
    name: 'Project Three',
    description:
      'Add a description for this project — what it does and why it matters.',
    year: '2023',
    href: '#',
    tags: ['AI', 'Python'],
    gradientClassName: 'bg-gradient-to-br from-amber-300 to-orange-500',
  },
  {
    id: '4',
    name: 'Project Four',
    description:
      'Add a description for this project — what it does and why it matters.',
    year: '2023',
    href: '#',
    tags: ['Open Source'],
    gradientClassName: 'bg-gradient-to-br from-violet-400 to-fuchsia-300',
  },
]

export function ProjectsSection() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mb-10 text-left">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Selected Work
        </p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Things I&apos;ve built
        </h2>
        <p className="mt-3 text-muted-foreground">
          A few projects I&apos;m proud of — real case studies coming soon.
        </p>
      </div>

      <ProjectShowcase projects={PROJECTS} />
    </section>
  )
}
