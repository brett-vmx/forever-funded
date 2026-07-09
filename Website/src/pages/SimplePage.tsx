import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/LogoMark'

/** Minimal chrome for stub/standalone pages (Privacy, Terms, Checkout). */
export function SimplePage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-5 sm:px-8">
          <Link to="/" aria-label="Forever Funded home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14 sm:px-8">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 leading-relaxed text-muted">{children}</div>
        <Link
          to="/"
          className="mt-10 inline-block font-heading font-semibold text-primary-dark hover:underline"
        >
          ← Back home
        </Link>
      </main>
    </div>
  )
}
