import { Section } from '../ui/Section'
import { Button } from '../ui/Button'
import { EmailCapture } from '../ui/EmailCapture'
import { useAuthModal } from '../auth/AuthModal'
import { LogoMark } from '../ui/LogoMark'

/** Sketch of a Coach report: a few lines, each flagged good/worth-considering/needs-fixing. */
function ChecklistSketch() {
  const rows = [
    { icon: '✅', tone: 'text-primary-dark' },
    { icon: '🟠', tone: 'text-brown' },
    { icon: '✅', tone: 'text-primary-dark' },
    { icon: '🔴', tone: 'text-brick' },
  ]
  return (
    <div className="space-y-4 rounded-xl border border-border bg-band-emerald p-5" aria-hidden="true">
      <div className="h-2 w-1/3 rounded-full bg-ink/40" />
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-base leading-none">{row.icon}</span>
            <div className="h-2 flex-1 rounded-full bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Sketch of a video player card: dotted top bar, play panel, bottom scrubber. */
function VideoLessonSketch() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border-[3px] border-ink"
      aria-hidden="true"
    >
      {/* Top bar with two "camera" dots */}
      <div className="flex items-center justify-center gap-1.5 border-b-[3px] border-ink bg-surface py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-ink" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink" />
      </div>

      {/* Play panel */}
      <div className="flex flex-1 items-center justify-center bg-band-emerald">
        <svg viewBox="0 0 24 24" className="h-14 w-14 text-ink/40" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Bottom scrubber */}
      <div className="flex items-center gap-3 border-t-[3px] border-ink bg-surface px-4 py-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
        <div className="h-1.5 flex-1 rounded-full bg-ink/70" />
      </div>
    </div>
  )
}

export function CourseTeaser() {
  const { open } = useAuthModal()

  return (
    <Section id="course" tint="tan">
      <div className="mx-auto max-w-2xl text-center">
        <LogoMark className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          More than a tool.
          <br />
          <span className="text-primary">A whole new way to write.</span>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The <strong className="font-semibold text-ink">Email Coach</strong> is the fast
          way to sharpen a letter before you send it.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The <strong className="font-semibold text-ink">Email Course</strong> is the
          deeper way: the full framework the Coach is built on, in a set of short,
          practical lessons.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Coach — live now */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="bg-primary px-8 py-6 text-center">
            <h3 className="font-heading text-2xl font-bold text-white">Coach</h3>
          </div>
          <div className="flex flex-1 flex-col p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-band-emerald px-3 py-1 text-xs font-semibold text-primary-dark">
              <span className="h-2 w-2 rounded-full bg-primary" /> Live now
            </span>
            <h4 className="mt-4 font-heading text-xl font-bold text-ink">Email Coach</h4>
            <p className="mt-2 leading-relaxed text-muted">
              Get a seasoned second pair of eyes on every draft email before you send it to
              your supporters. Free to try.
            </p>
            <div className="mt-5 flex h-52 flex-col justify-center">
              <ChecklistSketch />
            </div>
            <Button size="lg" className="mt-6 w-full" onClick={() => open('signup')}>
              Start your free trial
            </Button>
          </div>
        </div>

        {/* Course — coming soon */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="bg-primary-dark px-8 py-6 text-center">
            <h3 className="font-heading text-2xl font-bold text-white">Course</h3>
          </div>
          <div className="flex flex-1 flex-col p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-camel/30 px-3 py-1 text-xs font-semibold text-brown">
              Coming soon
            </span>
            <h4 className="mt-4 font-heading text-xl font-bold text-ink">Email Course</h4>
            <p className="mt-2 leading-relaxed text-muted">
              Learn the full Forever Funded framework in short, practical lessons. Annual
              Coach subscribers get <strong className="text-ink">$50 off</strong> when it
              launches.
            </p>
            <div className="mt-5 h-52">
              <VideoLessonSketch />
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-ink">Get notified when it’s ready:</p>
              <EmailCapture
                source="course"
                cta="Get notified"
                inputClassName="!bg-band-emerald placeholder:!text-muted"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
