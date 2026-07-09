import { Button } from '../ui/Button'
import { useAuthModal } from '../auth/AuthModal'
import { LogoMark } from '../ui/LogoMark'

export function FinalCTA() {
  const { open } = useAuthModal()

  return (
    <section className="bg-primary-dark">
      <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8">
        <LogoMark className="mx-auto h-12 w-12 text-white/90" />
        <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
          Make your next update your best one.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/85">
          Try our email coach for free and see what it finds! Your first{' '}
          <span className="line-through opacity-70">3</span> 10 reviews are free during our
          launch.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            className="border-white bg-white text-primary-dark hover:bg-white/90 hover:text-primary-dark"
            onClick={() => open('signup')}
          >
            Start your free trial
          </Button>
          <span className="text-sm text-white/75">No credit card required.</span>
        </div>
      </div>
    </section>
  )
}
