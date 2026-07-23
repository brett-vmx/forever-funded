import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { REVIEW_DOMAIN } from '../lib/constants'
import { Logo } from '../components/ui/LogoMark'
import { Button } from '../components/ui/Button'
import {
  ProfileDetailsForm,
  type DeclaredFields,
} from '../components/profile/ProfileDetailsForm'

type ProfileRow = {
  review_slug: string
  reviews_limit: number
  access_expires_at: string | null
  tier: string
} & DeclaredFields

/** e.g. "August 15, 2026" */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Whole days from now until `iso` (negative if already past). */
function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function Profile() {
  const { session } = useSession()
  const navigate = useNavigate()
  const email = session?.user.email
  const userId = session?.user.id

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  // null while unresolved; true only on someone's very first /profile visit.
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null)

  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      supabase
        .from('profiles')
        .select(
          'review_slug, reviews_limit, access_expires_at, tier, first_name, last_name, city, country, ministry_title, organization_name, college_campus, coach_instructions',
        )
        .eq('id', userId)
        .maybeSingle(),
      supabase.rpc('remaining_reviews', { p_user_id: userId }),
      supabase.rpc('mark_profile_seen'),
    ]).then(([profileRes, remainingRes, seenRes]) => {
      setProfile((profileRes.data as ProfileRow) ?? null)
      setRemaining(typeof remainingRes.data === 'number' ? remainingRes.data : null)
      setIsFirstVisit(seenRes.data === true)
      setLoading(false)
    })
  }, [userId])

  const reviewAddress = profile ? `${profile.review_slug}@${REVIEW_DOMAIN}` : null
  // Falls back to email for accounts created before first-name capture existed.
  const greetingName = profile?.first_name || email

  async function copyAddress() {
    if (!reviewAddress) return
    try {
      await navigator.clipboard.writeText(reviewAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail quietly.
    }
  }

  async function signOut() {
    await supabase?.auth.signOut()
    navigate('/', { replace: true })
  }

  const used =
    profile && remaining !== null ? Math.max(0, profile.reviews_limit - remaining) : null
  const expiresSoon =
    profile?.access_expires_at != null && daysUntil(profile.access_expires_at) <= 7

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
          {loading ? (
            'Welcome'
          ) : (
            <>
              {isFirstVisit ? 'You’re in' : 'Welcome back'}
              {greetingName ? ',' : '.'}{' '}
              {greetingName && <span className="text-primary">{greetingName}</span>}
            </>
          )}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Welcome to Forever Funded. You’re all set to start sending drafts to the Coach.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Your private review address</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Use the “send a test” button in whatever email tool you write in and send your
            draft here. Your point-by-point report comes back in about 83 seconds.
          </p>
          {loading ? (
            <p className="mt-4 h-12 animate-pulse rounded-lg bg-band-emerald/60" />
          ) : reviewAddress ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 truncate rounded-lg bg-band-emerald px-4 py-3 font-mono text-sm text-primary-dark">
                {reviewAddress}
              </p>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={copyAddress}>
                {copied ? 'Copied ✓' : 'Copy'}
              </Button>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-band-emerald px-4 py-3 text-sm text-primary-dark">
              Check your inbox for a welcome email with your review address.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Your account</h2>
          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-band-emerald/60" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-band-emerald/60" />
            </div>
          ) : profile ? (
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted">Reviews</dt>
                <dd className="mt-1 leading-relaxed">
                  {used !== null ? (
                    <>
                      You’ve used{' '}
                      <strong className="font-semibold text-ink">{used}</strong> of{' '}
                      <strong className="font-semibold text-ink">
                        {profile.reviews_limit}
                      </strong>{' '}
                      reviews.{' '}
                      <span className="text-primary-dark">
                        <strong className="font-semibold">{remaining}</strong> remaining.
                      </span>
                    </>
                  ) : (
                    <span className="text-muted">
                      {profile.reviews_limit} reviews included.
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Access</dt>
                <dd className="mt-1 leading-relaxed">
                  {profile.access_expires_at ? (
                    <>
                      Your access expires on{' '}
                      <strong className="font-semibold text-ink">
                        {formatDate(profile.access_expires_at)}
                      </strong>
                      .
                      {expiresSoon && (
                        <span className="mt-1 block text-sm text-brick">
                          That’s coming up soon, be sure to use your remaining reviews.
                        </span>
                      )}
                    </>
                  ) : (
                    'No expiration.'
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 leading-relaxed text-muted">
              We couldn’t load your account details just now. Try refreshing the page.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Your details (optional)</h2>
          <p className="mt-2 leading-relaxed text-muted">
            This helps us know you and gives the Coach helpful background. You can leave
            any of it blank.
          </p>
          {loading ? (
            <div className="mt-5 space-y-4">
              <div className="h-9 animate-pulse rounded-lg bg-band-emerald/60" />
              <div className="h-9 animate-pulse rounded-lg bg-band-emerald/60" />
              <div className="h-24 animate-pulse rounded-lg bg-band-emerald/60" />
            </div>
          ) : profile ? (
            <ProfileDetailsForm
              initial={{
                first_name: profile.first_name,
                last_name: profile.last_name,
                city: profile.city,
                country: profile.country,
                ministry_title: profile.ministry_title,
                organization_name: profile.organization_name,
                college_campus: profile.college_campus,
                coach_instructions: profile.coach_instructions,
              }}
            />
          ) : null}
        </div>

        {/* TODO(v2): review history. */}
      </main>
    </div>
  )
}
