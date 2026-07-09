import { Section } from '../ui/Section'
import { Button } from '../ui/Button'
import { useAuthModal } from '../auth/AuthModal'

export function Pricing() {
  const { open } = useAuthModal()

  return (
    <Section id="pricing" tint="white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Simple pricing. <span className="text-primary">Start free.</span>
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          If our Email Coach helps you keep just one $10-a-month supporter engaged, it
          pays for itself! It should be a no-brainer for the long haul.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {/* FREE — Launch Bonus */}
        <div className="relative rounded-2xl border-2 border-ink bg-band-emerald p-8 shadow-xl ring-2 ring-primary/30 lg:-mt-4 lg:mb-4">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-heading text-xs font-bold uppercase tracking-wider text-white shadow">
            Launch Bonus
          </span>
          <p>
            <span className="font-heading text-2xl font-bold leading-none text-muted line-through decoration-primary">
              3
            </span>{' '}
            <span className="font-heading text-5xl font-bold leading-none text-primary">10</span>{' '}
            <span className="font-heading text-2xl font-bold leading-none text-ink">credits</span>
          </p>
          <h3 className="mt-2 font-heading text-xl font-semibold">90 days</h3>
          <p className="mt-3 font-heading text-3xl font-bold text-ink">
            $0<span className="text-base font-medium text-muted">/mo</span>
          </p>
          <p className="mt-3 font-medium text-ink">10 reviews &amp; revisions.</p>
          <p className="mt-1 leading-relaxed text-muted">
            10 free credits to try the Coach on your drafts &amp; revisions.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => open('signup')}>
            Start your free trial
          </Button>
          <p className="mt-3 text-center text-sm text-muted">No credit card required.</p>
        </div>

        {/* MONTHLY */}
        <div className="rounded-2xl border-2 border-ink bg-surface p-8 lg:-mt-4">
          <Symbol value="∞" />
          <h3 className="mt-2 font-heading text-xl font-semibold">Monthly</h3>
          <p className="mt-3 font-heading text-3xl font-bold text-ink">
            $19<span className="text-base font-medium text-muted">/mo</span>
          </p>
          <p className="mt-3 font-medium text-ink">Unlimited reviews &amp; revisions.</p>
          <p className="mt-1 leading-relaxed text-muted">
            Every letter, every draft, reviewed before you send.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => open('signup')}>
            Get unlimited coaching
          </Button>
        </div>

        {/* ANNUAL — Most Popular */}
        <div className="relative rounded-2xl border-2 border-ink bg-surface p-8 shadow-xl ring-2 ring-primary/30 lg:-mt-4 lg:mb-4">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-heading text-xs font-bold uppercase tracking-wider text-white shadow">
            Most Popular
          </span>
          <Symbol value="∞" />
          <h3 className="mt-2 font-heading text-xl font-semibold">Annual</h3>
          <p className="mt-3 font-heading text-3xl font-bold text-ink">
            $97<span className="text-base font-medium text-muted">/yr</span>{' '}
            <span className="text-sm font-semibold text-primary-dark">(just $8/mo)</span>
          </p>
          <p className="mt-3 font-medium text-ink">Unlimited reviews &amp; revisions.</p>
          <p className="mt-1 leading-relaxed text-muted">
            Everything in Monthly, plus{' '}
            <strong className="text-ink">
              $50 off the <a href="#course" className="underline hover:no-underline">Course</a>
            </strong>{' '}
            when it launches.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => open('signup')}>
            Get unlimited coaching
          </Button>
        </div>
      </div>
    </Section>
  )
}

function Symbol({ value }: { value: string }) {
  return (
    <span className="font-heading text-5xl font-bold leading-none text-primary">{value}</span>
  )
}
