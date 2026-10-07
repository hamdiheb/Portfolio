'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface Project {
  id: string
  name: string
  description: string
  year: string
  href?: string
  tags?: string[]
  gradientClassName: string
}

interface ProjectShowcaseProps {
  projects: Project[]
  className?: string
}

const PREVIEW_HEIGHT = 160
const PREVIEW_WIDTH = 224

export function ProjectShowcase({ projects, className }: ProjectShowcaseProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [previewTop, setPreviewTop] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const activeProject = projects.find((p) => p.id === hoveredId)

  function handleEnter(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const rowRect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (containerRect) {
      setPreviewTop(rowRect.top - containerRect.top + rowRect.height / 2 - PREVIEW_HEIGHT / 2)
    }
    setHoveredId(id)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="flex flex-col">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.href ?? '#'}
            onMouseEnter={(e) => handleEnter(e, project.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group flex w-full items-baseline justify-between gap-4 border-b border-border py-6 first:pt-0 last:border-b-0"
          >
            <div className="max-w-md text-left">
              <span className="inline-flex gap-1 text-lg font-semibold text-foreground underline-offset-4 group-hover:underline">
                {project.name}
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">{project.year}</span>
          </a>
        ))}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -6, top: previewTop }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{
              position: 'absolute',
              right: 0,
              height: PREVIEW_HEIGHT,
              width: PREVIEW_WIDTH,
            }}
            className={cn(
              'pointer-events-none z-10 hidden rounded-2xl shadow-xl sm:block',
              activeProject.gradientClassName,
            )}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
