/** Hero visual — a sweaty hand hovering over the send button. */
export function HeroSwipe() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md"
      aria-label="A nervous hand hovering over the send button"
    >
      <div className="absolute inset-0 rounded-[2rem] border-2 border-gray-200 bg-band-emerald shadow-[0_30px_60px_-25px_rgba(5,150,105,0.35)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <img
          src="/sweaty-hand-over-send-button.svg"
          alt="A nervous hand hovering over the send button"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
