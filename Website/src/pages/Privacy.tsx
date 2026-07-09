import { SimplePage } from './SimplePage'

export function Privacy() {
  return (
    <SimplePage title="Privacy Policy">
      <p className="text-sm text-muted">
        <strong className="font-semibold text-ink">Effective date:</strong> July 9, 2026
      </p>

      <p>
        Forever Funded (“Forever Funded,” “we,” “us”) is operated by VMX Media. This
        policy explains what we collect, how we use it, and the choices you have. We
        wrote it in plain language because our audience deserves that.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">What we collect</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="font-semibold text-ink">Your account details.</strong> The
          email address you sign up with. We use passwordless “magic link” sign-in, so
          we do not store a password.
        </li>
        <li>
          <strong className="font-semibold text-ink">The drafts you send for review.</strong>{' '}
          When you send a supporter email to your private review address, we receive and
          store that draft’s content, subject line, and sender/recipient metadata so the
          Coach can review it.
        </li>
        <li>
          <strong className="font-semibold text-ink">The reports we generate.</strong> The
          coaching report produced for each draft.
        </li>
        <li>
          <strong className="font-semibold text-ink">Basic usage records.</strong> Which
          reviews you’ve used, timestamps, and technical logs needed to run and secure the
          service.
        </li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">How we use it</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>To generate your coaching reports and deliver them to you.</li>
        <li>To operate, secure, and improve the service.</li>
        <li>
          <strong className="font-semibold text-ink">
            To improve the Coach during our early pilot.
          </strong>{' '}
          So we can make the Coach’s feedback better, the operator may personally review
          submitted drafts and the reports they produced. This is how we calibrate
          quality. Your submissions are <strong className="font-semibold text-ink">never</strong>{' '}
          shared with other users, sold, or used to train outside AI models.
        </li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        Who can see your data
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="font-semibold text-ink">Other users cannot see your data.</strong>{' '}
          Access is enforced at the database level (row-level security), so no other user
          can read your drafts or reports.
        </li>
        <li>
          <strong className="font-semibold text-ink">
            The operator can access submissions
          </strong>{' '}
          for the calibration purpose described above, and our infrastructure providers
          process data on our behalf (below).
        </li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        Service providers we use
      </h2>
      <p>
        We rely on trusted providers to run the service. Each processes your data only to
        provide their service to us:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="font-semibold text-ink">Supabase</strong> — database and
          authentication.
        </li>
        <li>
          <strong className="font-semibold text-ink">Postmark</strong> — sending and
          receiving email.
        </li>
        <li>
          <strong className="font-semibold text-ink">Anthropic</strong> — the AI that
          generates your report, used under commercial terms that{' '}
          <strong className="font-semibold text-ink">
            do not permit your content to be used to train AI models
          </strong>
          .
        </li>
        <li>
          <strong className="font-semibold text-ink">Cloudflare</strong> — hosting and
          request processing.
        </li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        How your data is protected
      </h2>
      <p>
        Your drafts move through an encrypted connection, and data is stored with access
        controls that keep users’ data separated. No system is perfectly secure, but we
        take reasonable measures to protect your information.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        Data retention and deletion
      </h2>
      <p>
        During our early pilot, we retain your drafts and reports so we can review and
        improve the Coach.{' '}
        <strong className="font-semibold text-ink">
          You can ask us to delete your data at any time
        </strong>{' '}
        by emailing hello (at) foreverfunded.org, and we will remove it. We expect to
        introduce automatic deletion after a set period as the product matures.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Your choices</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Request a copy of your data, or its deletion, by emailing hello (at) foreverfunded.org.</li>
        <li>Stop using the service at any time.</li>
      </ul>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Children</h2>
      <p>The service is intended for adults and is not directed to children under 16.</p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">
        Changes to this policy
      </h2>
      <p>
        We may update this policy; we’ll post the new effective date here and, for
        material changes, let you know.
      </p>

      <h2 className="pt-2 font-heading text-xl font-semibold text-ink">Contact</h2>
      <p>Questions about privacy? Email hello (at) foreverfunded.org.</p>

      <p className="border-t border-border pt-6 text-sm italic text-muted">
        This is a plain-language starting point, not legal advice. Have it reviewed by a
        qualified attorney before you rely on it — especially regarding data handling,
        international users, and payment processing.
      </p>
    </SimplePage>
  )
}
