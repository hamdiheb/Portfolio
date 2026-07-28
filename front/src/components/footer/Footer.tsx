import { ArrowUp } from 'lucide-react'

import { SOCIAL_LINKS } from '@/components/contact/socials'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="px-4 pt-10 pb-6 text-left sm:pb-8">
      <div className="mx-auto max-w-6xl">
        {/* Right padding keeps "Back to top" clear of the fixed chat launcher. */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t pt-6 pr-16 text-xs text-muted-foreground sm:pr-20">
          <p className="m-0!">© {year} Iheb Hamdi</p>
          <a
            href="#home"
            className="group -my-2 inline-flex min-h-10 items-center gap-1.5 font-medium transition-colors hover:text-foreground"
          >
            Back to top
            <ArrowUp
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
