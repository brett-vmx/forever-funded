import { useSearchParams } from 'react-router-dom'
import { SimplePage } from './SimplePage'

/**
 * Placeholder checkout landing. Paid CTAs point here for launch; Stripe wiring
 * is post-launch. Reads ?plan= so the eventual integration knows which plan.
 */
export function Checkout() {
  const [params] = useSearchParams()
  const plan = params.get('plan') === 'annual' ? 'Annual ($97/yr)' : 'Monthly ($19/mo)'

  return (
    <SimplePage title="Checkout is coming soon">
      <p className="rounded-lg bg-band-emerald px-4 py-3 text-sm text-primary-dark">
        You selected: <strong>{plan}</strong>
      </p>
      <p>
        Paid plans open right after launch. In the meantime, you can{' '}
        <strong className="text-ink">start free with 10 credits</strong> (no credit card
        required) and upgrade the moment checkout is live.
      </p>
      {/* TODO(post-launch): wire Stripe checkout for the selected plan. */}
    </SimplePage>
  )
}
