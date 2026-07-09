import { Link } from 'react-router-dom'
import { Logo } from '../ui/LogoMark'
import { EmailCapture } from '../ui/EmailCapture'
import { useAuthModal } from '../auth/AuthModal'

export function Footer() {
  const { open } = useAuthModal()

  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
        {/* Brand + tagline */}
        <div>
          <Logo markClassName="text-primary-light" wordClassName="text-white" />
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Better stories. Deeper relationships. Lasting support.
          </p>
        </div>

        {/* Product */}
        <nav aria-label="Product">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Product
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="#features" className="transition hover:text-white">
                Email Coach
              </a>
            </li>
            <li>
              <a href="#course" className="transition hover:text-white">
                Course <span className="text-white/40">(soon)</span>
              </a>
            </li>
            <li>
              <a href="#pricing" className="transition hover:text-white">
                Pricing
              </a>
            </li>
            <li>
              <button onClick={() => open('login')} className="transition hover:text-white">
                Log in
              </button>
            </li>
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Organization">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Organization
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {/* TODO: real About / Contact destinations */}
            <li>
              <a href="#founder" className="transition hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="mailto:hello@foreverfunded.org" className="transition hover:text-white">
                Contact
              </a>
            </li>
          </ul>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-white">
            Legal
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Get updates
          </h3>
          <p className="mt-3 text-sm text-white/60">
            Get updates when we release new products and features.
          </p>
          <EmailCapture source="newsletter" cta="Subscribe" className="mt-3" dark />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-white/40 sm:flex-row sm:px-8">
          <p>© {2026} Forever Funded. All rights reserved.</p>
          <p>Made for ministry workers, everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
