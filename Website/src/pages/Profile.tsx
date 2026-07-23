import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { REVIEW_DOMAIN } from '../lib/constants'
import { Logo } from '../components/ui/LogoMark'
import { Button } from '../components/ui/Button'
import { type DeclaredFields } from '../components/profile/ProfileDetailsForm'
import { AccountTab } from '../components/profile/AccountTab'
import { ReportsTab } from '../components/profile/ReportsTab'
import { SubscriptionTab } from '../components/profile/SubscriptionTab'
import { getAccountStatus } from '../lib/accountStatus'
import { formatDate } from '../lib/formatDate'

type ProfileRow = {
  review_slug: string
  reviews_limit: number
  access_expires_at: string | null
  tier: string
} & DeclaredFields

const TABS = ['Account', 'Reports', 'Subscription'] as const
type Tab = (typeof TABS)[number]

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
  const [activeTab, setActiveTab] = useState<Tab>('Account')

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

  const expiresSoon =
    profile?.access_expires_at != null && daysUntil(profile.access_expires_at) <= 7
  const formattedExpiresAt = profile?.access_expires_at
    ? formatDate(profile.access_expires_at)
    : null
  const accountStatus = profile ? getAccountStatus(profile) : null

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
        {isFirstVisit && (
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Welcome to Forever Funded. You’re all set to start sending drafts to the Coach.
          </p>
        )}

        <div role="tablist" aria-label="Profile sections" className="mt-8 flex gap-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-6">
          {activeTab === 'Account' && (
            <AccountTab
              loading={loading}
              profile={profile}
              remaining={remaining}
              formattedExpiresAt={formattedExpiresAt}
              expiresSoon={expiresSoon}
              accountStatus={accountStatus}
              email={email}
              reviewAddress={reviewAddress}
              copied={copied}
              onCopyAddress={copyAddress}
            />
          )}
          {activeTab === 'Reports' && <ReportsTab userId={userId} />}
          {activeTab === 'Subscription' && <SubscriptionTab accountStatus={accountStatus} />}
        </div>
      </main>
    </div>
  )
}
