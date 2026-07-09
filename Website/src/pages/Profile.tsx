import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { Logo } from '../components/ui/LogoMark'
import { Button } from '../components/ui/Button'

/**
 * Minimal launch profile. Intentionally NOT coupled to the v1 profiles/reviews
 * schema (not applied yet). The full portal — live review address, remaining
 * credits, history — is the v2 build.
 */
export function Profile() {
  const { session } = useSession()
  const navigate = useNavigate()
  const email = session?.user.email

  async function signOut() {
    await supabase?.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16 sm:px-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          You’re in{email ? ',' : '.'}{' '}
          {email && <span className="text-primary">{email}</span>}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Welcome to Forever Funded. You’re all set to start sending drafts to the Coach.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Your private review address</h2>
          <p className="mt-2 leading-relaxed text-muted">
            We’re emailing you your personal review address. When it arrives, use the “send
            a test” button in whatever email tool you write in and send your draft there.
            Your point-by-point report comes back in about 83 seconds.
          </p>
          <p className="mt-4 rounded-lg bg-band-emerald px-4 py-3 text-sm text-primary-dark">
            Check your inbox for a welcome email with your review address.
          </p>
        </div>

        {/* TODO(v2): live review address, remaining credits, review history —
            wire once the profiles/reviews tables are applied. */}
      </main>
    </div>
  )
}
