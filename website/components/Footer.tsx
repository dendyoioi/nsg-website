import { Mail, MapPin } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { site } from "@/content/site";
import type { Content, Locale } from "@/content/types";

export function Footer({ locale: _locale, t }: { locale: Locale; t: Content }) {
  const links = [
    { href: `#${site.anchors.about}`, label: t.nav.about },
    { href: `#${site.anchors.divisions}`, label: t.nav.divisions },
    { href: `#${site.anchors.advantages}`, label: t.nav.advantages },
    { href: `#${site.anchors.contact}`, label: t.nav.contact },
  ];
  return (
    <footer className="bg-gradient-to-br from-brand-950 to-brand-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1.3fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <div>
              <div className="font-display text-base font-bold">{site.name}</div>
              <div className="text-xs text-brand-300">{site.tagline}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            {t.footer.navTitle}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/80">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-brand-300">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            {t.footer.contactTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
              <span>{site.addressFull}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-brand-300">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/60">
        {t.footer.copyright}
      </div>
    </footer>
  );
}
