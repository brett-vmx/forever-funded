import {
  ProfileDetailsForm,
  type DeclaredFields,
} from './ProfileDetailsForm'
import type { AccountStatus } from '../../lib/accountStatus'
import { accountStatusColor } from '../../lib/accountStatus'

type AccountTabProfile = {
  reviews_limit: number
} & DeclaredFields

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  )
}

export function AccountTab({
  loading,
  profile,
  remaining,
  formattedExpiresAt,
  expiresSoon,
  accountStatus,
  email,
  reviewAddress,
  copied,
  onCopyAddress,
}: {
  loading: boolean
  profile: AccountTabProfile | null
  remaining: number | null
  formattedExpiresAt: string | null
  expiresSoon: boolean
  accountStatus: AccountStatus | null
  email: string | undefined
  reviewAddress: string | null
  copied: boolean
  onCopyAddress: () => void
}) {
  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <h2 className="font-heading text-xl font-semibold">Account details</h2>
        {loading ? (
          <div className="mt-4 space-y-3">
            <div className="h-12 w-full animate-pulse rounded-xl bg-band-emerald/60" />
            <div className="h-5 w-full animate-pulse rounded bg-band-emerald/60" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-band-emerald/60" />
          </div>
        ) : profile ? (
          <>
            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-band-emerald px-5 py-5">
              <div className="min-w-0">
                <p className="font-heading font-bold text-ink">
                  Personal Review Address (send test emails here)
                </p>
                {reviewAddress ? (
                  <p className="mt-1 truncate text-sm font-medium text-primary-dark">
                    {reviewAddress}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">Check your inbox</p>
                )}
              </div>
              {reviewAddress && (
                <button
                  type="button"
                  onClick={onCopyAddress}
                  aria-label={copied ? 'Copied' : 'Copy review address'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary-dark transition hover:bg-white"
                >
                  {copied ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <dl className="mt-3 divide-y divide-border">
              <Row label="Reports sent to">{email ?? '—'}</Row>

              <Row label="Account status">
                <span className={accountStatusColor(accountStatus)}>
                  {accountStatus ?? 'Unknown'}
                </span>
              </Row>
              <Row label="Reviews remaining">{remaining ?? profile.reviews_limit}</Row>
              <Row label="Access expires on">
                <span>
                  {formattedExpiresAt ?? 'No expiration'}
                  {expiresSoon && (
                    <span className="mt-1 block text-right text-xs font-normal text-brick">
                      Coming up soon
                    </span>
                  )}
                </span>
              </Row>
            </dl>
          </>
        ) : (
          <p className="mt-4 leading-relaxed text-muted">
            We couldn’t load your account details just now. Try refreshing the page.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <h2 className="font-heading text-xl font-semibold">Your details (optional)</h2>
        <p className="mt-2 leading-relaxed text-muted">
          This gives the Coach helpful context for your reports.
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
    </>
  )
}
