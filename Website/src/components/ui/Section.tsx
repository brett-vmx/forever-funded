import type { ReactNode } from 'react'

export type Tint = 'white' | 'emerald' | 'tan' | 'brick' | 'camel' | 'forest'

const tints: Record<Tint, string> = {
  white: 'bg-surface',
  emerald: 'bg-band-emerald',
  tan: 'bg-band-tan',
  brick: 'bg-band-brick',
  camel: 'bg-camel/25',
  forest: 'bg-primary-dark text-white',
}

/**
 * A full-width section band with a token-driven background tint, plus a
 * centered max-width container. Cycle the tints down the page (see LandingPage)
 * so it never reads as a wall of white cards.
 */
export function Section({
  id,
  tint = 'white',
  className = '',
  containerClassName = '',
  children,
}: {
  id?: string
  tint?: Tint
  className?: string
  containerClassName?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`${tints[tint]} scroll-mt-24 ${className}`}>
      <div
        className={`mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24 ${containerClassName}`}
      >
        {children}
      </div>
    </section>
  )
}

/** Two-tone section heading: accent phrase in a brand color, rest in ink. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.14em] text-primary-dark">
      {children}
    </p>
  )
}
