import * as React from 'react'
import { SiGithub } from 'react-icons/si'

import ContributionSkyline, {
  type ContributionDay,
} from '@/components/ui/contribution-skyline'

const GITHUB_USER = 'hamdiheb'
const PROFILE_URL = `https://github.com/${GITHUB_USER}`
// GitHub has no token-free contributions endpoint; this public proxy scrapes the
// profile calendar and serves it with CORS enabled.
const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`
const PROFILE_API_URL = `https://api.github.com/users/${GITHUB_USER}`

interface Profile {
  public_repos: number
  followers: number
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; days: ContributionDay[] }

export function GithubActivity() {
  const [state, setState] = React.useState<State>({ status: 'loading' })
  const [profile, setProfile] = React.useState<Profile | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    fetch(CONTRIBUTIONS_URL, { signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ contributions: ContributionDay[] }>
      })
      .then((json) => {
        const days = json.contributions.map(({ date, count }) => ({ date, count }))
        setState({ status: 'ready', days })
      })
      .catch(() => {
        if (!signal.aborted) setState({ status: 'error' })
      })

    // Profile counts are a nice-to-have; the section works without them.
    fetch(PROFILE_API_URL, { signal })
      .then((res) => (res.ok ? (res.json() as Promise<Profile>) : null))
      .then((json) => json && setProfile(json))
      .catch(() => {})

    return () => controller.abort()
  }, [])

  return (
    <section className="relative px-4 py-16 text-left">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Open Source
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            My GitHub activity
          </h2>
          {profile && (
            <p className="mt-3! text-muted-foreground">
              {profile.public_repos} public repositories · {profile.followers}{' '}
              followers
            </p>
          )}
        </div>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <SiGithub className="h-4 w-4" />@{GITHUB_USER}
        </a>
      </div>

      {state.status === 'loading' && (
        <div
          aria-busy="true"
          aria-label="Loading GitHub contributions"
          className="h-72 w-full animate-pulse rounded-xl border bg-muted/40"
        />
      )}

      {state.status === 'error' && (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Couldn&apos;t load contributions right now.{' '}
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            See them on GitHub
          </a>
          .
        </div>
      )}

      {state.status === 'ready' && (
        <ContributionSkyline
          data={state.days}
          palette="github"
          footer={null}
        />
      )}
    </section>
  )
}
