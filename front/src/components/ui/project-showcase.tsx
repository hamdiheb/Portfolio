'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SiGithub } from 'react-icons/si'

import { cn } from '@/lib/utils'

export interface Project {
  id: string
  name: string
  description: string
  year: string
  /** Short context shown next to the year, e.g. "Freelance" or "Team of 3". */
  role?: string
  /** Live site. Without it the row is plain text. */
  href?: string
  /** Source code. */
  repoHref?: string
  tags?: string[]
  /** Screenshot of the live site, shown in the hover preview. */
  image?: string
  /** Hover-preview background when there's no screenshot. */
  gradientClassName: string
}

interface ProjectShowcaseProps {
  projects: Project[]
  className?: string
}

// 16:10, the shape of the desktop screenshots. A little narrower on small laptops so the
// card doesn't cover the description column.
const previewSize = () => {
  const width = window.innerWidth >= 1280 ? 320 : 272
  return { width, height: Math.round(width * 0.625) }
}

export function ProjectShowcase({ projects, className }: ProjectShowcaseProps) {
  const reduce = useReducedMotion()
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [previewTop, setPreviewTop] = React.useState(0)
  const [size, setSize] = React.useState({ width: 320, height: 200 })
  const containerRef = React.useRef<HTMLUListElement>(null)

  // Warm the cache once the browser is idle, so a screenshot is ready the first time a row is hovered.
  React.useEffect(() => {
    const preload = () => projects.forEach((p) => p.image && (new Image().src = p.image))
    const id = window.requestIdleCallback ? window.requestIdleCallback(preload) : window.setTimeout(preload, 1500)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id))
  }, [projects])

  const activeProject = projects.find((p) => p.id === hoveredId)

  function show(row: HTMLElement, id: string) {
    const rowRect = row.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    const next = previewSize()
    setSize(next)
    if (containerRect) {
      setPreviewTop(rowRect.top - containerRect.top + rowRect.height / 2 - next.height / 2)
    }
    setHoveredId(id)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <ul ref={containerRef} className="m-0 flex list-none flex-col p-0">
        {projects.map((project) => (
          <li
            key={project.id}
            onMouseEnter={(e) => show(e.currentTarget, project.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={(e) => show(e.currentTarget, project.id)}
            onBlur={() => setHoveredId(null)}
            className="group relative flex w-full items-baseline justify-between gap-4 border-b border-border py-6 first:pt-0 last:border-b-0"
          >
            <article className="max-w-xl text-left">
              <h3 className="m-0 text-lg font-semibold text-foreground">
                {project.href ? (
                  // The link's ::after covers the whole row, so the row stays one big click target.
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-foreground"
                  >
                    {project.name}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                    <span className="sr-only"> (opens live site in a new tab)</span>
                  </a>
                ) : (
                  project.name
                )}
              </h3>
              <p className="mt-1! text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              {(project.tags?.length || project.repoHref) && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {project.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.repoHref && (
                    <a
                      href={project.repoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} source code on GitHub`}
                      // Sits above the row-wide link so it stays clickable on its own.
                      className="relative z-10 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <SiGithub aria-hidden="true" className="h-3 w-3" />
                      Code
                    </a>
                  )}
                </div>
              )}
            </article>
            <p className="m-0 shrink-0 text-right text-sm text-muted-foreground">
              {project.role && <span className="block sm:inline">{project.role}<span className="hidden sm:inline"> · </span></span>}
              {project.year}
            </p>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject.id}
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -6, top: previewTop }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{
              position: 'absolute',
              // Clear of the role/year column so it stays readable.
              right: '7rem',
              height: size.height,
              width: size.width,
            }}
            className={cn(
              'pointer-events-none z-20 hidden flex-col justify-end overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10 lg:flex',
              !activeProject.image && cn('p-4', activeProject.gradientClassName),
            )}
          >
            {activeProject.image ? (
              <img
                src={activeProject.image}
                alt=""
                className="h-full w-full bg-muted object-cover object-top"
                decoding="async"
              />
            ) : (
              <>
                <span className="text-xl leading-tight font-bold tracking-tight text-white drop-shadow-sm">
                  {activeProject.name}
                </span>
                <span className="mt-1 text-xs font-medium text-white/80">
                  {[activeProject.role, activeProject.year].filter(Boolean).join(' · ')}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
