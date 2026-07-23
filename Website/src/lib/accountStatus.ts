export type AccountStatus = 'Trial' | 'Unlimited' | 'Expired'

/**
 * Derives the account's current status from tier + access_expires_at.
 * Expiration wins regardless of tier (a paid/pilot account can still lapse
 * if its access window has passed); otherwise trial vs. everything else.
 */
export function getAccountStatus(profile: {
  tier: string
  access_expires_at: string | null
}): AccountStatus {
  const isExpired =
    profile.access_expires_at != null &&
    new Date(profile.access_expires_at).getTime() <= Date.now()

  if (isExpired) return 'Expired'
  if (profile.tier === 'trial') return 'Trial'
  return 'Unlimited'
}

export function accountStatusColor(status: AccountStatus | null): string {
  switch (status) {
    case 'Unlimited':
      return 'text-primary-dark'
    case 'Expired':
      return 'text-brick'
    case 'Trial':
    default:
      return 'text-ink'
  }
}
