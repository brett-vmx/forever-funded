import type { AccountStatus } from '../../lib/accountStatus'
import { accountStatusColor } from '../../lib/accountStatus'

// Billing/Stripe management lands later. Until then, just the current status.
export function SubscriptionTab({ accountStatus }: { accountStatus: AccountStatus | null }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
      <h2 className="font-heading text-xl font-semibold">Account status</h2>
      <p className={`mt-2 text-lg font-semibold ${accountStatusColor(accountStatus)}`}>
        {accountStatus ?? 'Unknown'}
      </p>
    </div>
  )
}
