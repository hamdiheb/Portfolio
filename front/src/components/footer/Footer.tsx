import { ArrowUp } from 'lucide-react'

import { SOCIAL_LINKS } from '@/components/contact/socials'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="border-t px-4 pt-10 pb-6 text-left sm:pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0! text-lg font-bold tracking-tight text-foreground">Iheb Hamdi</p>
            <p className="mt-1! text-sm text-muted-foreground">Full-Stack Engineer · Barcelona, Spain</p>
          </div>

          <ul className="m-0 flex list-none items-center gap-2 p-0">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => {
              const external = href.startsWith('http')
              return (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    aria-label={external ? `${label} (opens in a new tab)` : label}
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right padding keeps "Back to top" clear of the fixed chat launcher. */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t pt-6 pr-16 text-xs text-muted-foreground sm:pr-20">
          <p className="m-0!">© {year} Iheb Hamdi</p>
          <a
            href="#home"
            className="group -my-2 inline-flex min-h-10 items-center gap-1.5 font-medium transition-colors hover:text-foreground"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
