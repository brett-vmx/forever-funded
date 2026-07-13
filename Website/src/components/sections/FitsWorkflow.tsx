import { Section } from '../ui/Section'
import mailchimp from '../../assets/esp/Mailchimp.jpg'
import kit from '../../assets/esp/Kit.webp'
import mailerlite from '../../assets/esp/mailerlite.jpg'
import constantContact from '../../assets/esp/constant-contact.jpg'
import missio from '../../assets/esp/missio.jpg'
import gmail from '../../assets/esp/gmail.svg'
import outlook from '../../assets/esp/outlook.webp'

// `border: true` for logos that sit on a white/transparent background, so they
// don't blend into the page. `contain` + `bg` are for non-square logos that we
// scale down (with padding) so their mark matches the others instead of being
// cropped edge-to-edge by object-cover.
const LOGOS = [
  { name: 'Mailchimp', src: mailchimp },
  { name: 'Kit', src: kit },
  { name: 'MailerLite', src: mailerlite },
  { name: 'Constant Contact', src: constantContact },
  { name: 'Missio', src: missio, contain: true, bg: 'bg-black' },
  { name: 'Gmail', src: gmail, contain: true, bg: 'bg-white', border: true },
  { name: 'Outlook', src: outlook, border: true },
]

function LogoTile({ logo }: { logo: (typeof LOGOS)[number] }) {
  return (
    <div
      className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-sm ${logo.bg ?? ''} ${
        logo.border ? 'border border-border' : ''
      }`}
    >
      <img
        src={logo.src}
        alt={logo.name}
        className={`h-full w-full ${logo.contain ? 'object-contain p-3' : 'object-cover'}`}
      />
    </div>
  )
}

export function FitsWorkflow() {
  return (
    <Section tint="forest">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          <span className="text-[#a7f3d0]">Works with the </span>
          <span className="text-white">tools you already use.</span>
        </h2>
      </div>

      {/* Mobile: seamless horizontal marquee */}
      <div className="mt-10 overflow-hidden sm:hidden">
        <div className="flex w-max gap-4 animate-[marquee_28s_linear_infinite]">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <LogoTile key={`${logo.name}-${i}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* Desktop: static wrapped row */}
      <ul className="mx-auto mt-10 hidden max-w-4xl flex-wrap items-center justify-center gap-4 sm:flex">
        {LOGOS.map((logo) => (
          <li key={logo.name}>
            <LogoTile logo={logo} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
