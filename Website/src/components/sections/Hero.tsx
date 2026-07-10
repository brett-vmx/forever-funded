import { Button } from '../ui/Button'
import { useAuthModal } from '../auth/AuthModal'
import { HeroSwipe } from '../HeroSwipe'

export function Hero() {
  const { open } = useAuthModal()

  return (
    <section id="top" className="relative overflow-hidden">
      {/* soft top wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-band-emerald to-transparent"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-28">
        <div>
          <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-[0.14em] text-primary-dark">
            The Forever Funded Email Coach
          </p>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Stop sweating the <span className="text-primary">send button.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Before you send your next supporter update, send it to Coach!
          </p>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted">
            Coach checks for{' '}
            <strong className="font-semibold text-ink">22 best practices</strong> that
            will keep your supporters engaged, praying for you, and supporting you for
            the long haul.
          </p>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted">
            He also checks for{' '}
            <strong className="font-semibold text-ink">26 common mistakes</strong> that
            cause supporters to quietly archive your message.
          </p>
          <p className="mt-4 max-w-xl text-lg font-semibold leading-relaxed text-ink">
            Try Coach for free and see what he finds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button size="lg" onClick={() => open('signup')}>
              Start your free trial
            </Button>
            <span className="text-sm text-muted">No credit card required.</span>
          </div>

        </div>

        <div className="order-first lg:order-last">
          <HeroSwipe />
        </div>
      </div>
    </section>
  )
}
