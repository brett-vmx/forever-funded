/**
 * The flying-f mark, inlined from src/assets/02-flying-f-final.svg so it can
 * inherit color via `currentColor` (emerald on light, white on dark footer).
 *
 * NOTE: kept as a thin inline copy of the referenced asset. If a polished mark
 * lands in src/assets, update the paths here (or switch to <img src={asset}/>)
 * in this one place — nothing else hardcodes the geometry.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 178 178"
      className={className}
      role="img"
      aria-label="Forever Funded"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M98 34 C98 24 87 22 80 28 C77 31 76 35 76 40 V94 C76 114 60 122 44 120" />
        <path d="M62 56 H92" />
        <path d="M44 120 C36 112 36 102 44 102 C52 102 52 112 44 120 C36 128 36 138 44 138 C52 138 52 128 44 120 Z" />
      </g>
    </svg>
  )
}

/** Mark + "Forever Funded" wordmark, used in header and footer. */
export function Logo({
  className = '',
  markClassName = 'text-primary',
  wordClassName = 'text-ink',
}: {
  className?: string
  markClassName?: string
  wordClassName?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`h-8 w-8 shrink-0 ${markClassName}`} />
      <span
        className={`font-heading text-xl font-semibold tracking-tight ${wordClassName}`}
      >
        Forever Funded
      </span>
    </span>
  )
}
