import { ArrowRight, Clock, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Footer({ t }: { t: Content }) {
  const mailSubject = encodeURIComponent("Permintaan Informasi & Penawaran Proyek NSG");
  const mailBody = encodeURIComponent("Halo Tim PT Nattu Global Synergy,\n\nSaya ingin berkonsultasi mengenai kebutuhan proyek/pengadaan kami:\n- Nama Perusahaan:\n- Kebutuhan (Konstruksi / Logam / Suku Cadang Elektronik):\n- Detail Proyek:\n\nTerima kasih.");
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${site.email}&su=${mailSubject}&body=${mailBody}`;

  const links = [
    { href: `#${site.anchors.about}`, label: t.nav.about },
    { href: `#${site.anchors.divisions}`, label: t.nav.divisions },
    { href: `#${site.anchors.advantages}`, label: t.nav.advantages },
  ];

  return (
    <footer
      id={site.anchors.contact}
      className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-950 to-black text-white"
    >
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[600px] rounded-full bg-brand-500/10 blur-[100px]" />

      {/* Top CTA Banner */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-brand-900/60 via-slate-900/60 to-brand-950/60 p-8 sm:p-10 backdrop-blur-md md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-300">
                Konsultasi & Pengadaan
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Siap Memulai Kemitraan Proyek Bersama NSG?
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Hubungi tim kami untuk konsultasi konstruksi atau permintaan penawaran material & komponen.
              </p>
            </div>

            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-7 py-3.5 text-sm font-bold text-brand-950 shadow-lg shadow-brand-500/20 transition-all duration-200 hover:brightness-110 hover:shadow-xl active:scale-95"
            >
              <span>Kirim Email Penawaran</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_0.8fr_1.3fr]">
        {/* Brand Col */}
        <div>
          <Logo className="h-12 w-32" />
          <div className="mt-4 font-display text-base font-bold text-white">
            {site.name}
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-brand-300">
            {site.tagline}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-slate-400 max-w-sm">
            Perusahaan konstruksi konvensional dan perdagangan besar bahan konstruksi logam serta suku cadang elektronik terpercaya di Jakarta.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
            {t.footer.navTitle}
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="transition-colors hover:text-brand-300 inline-flex items-center gap-1.5"
                >
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={`#${site.anchors.home}`}
                className="transition-colors hover:text-brand-300"
              >
                Kembali ke Atas ↑
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info Col */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
            {t.footer.contactTitle} & Kantor Pusat
          </h4>
          <ul className="mt-5 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-400" />
              <span className="leading-relaxed text-xs sm:text-sm">
                {site.addressFull}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-brand-400" />
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium text-brand-300 transition-colors hover:underline hover:text-white"
              >
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-brand-400" />
              <span className="text-xs text-slate-400">
                Senin – Jumat: 08.30 – 17.00 WIB
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 sm:flex-row">
          <div>{t.footer.copyright}</div>
          <div className="text-[11px] text-slate-400">
            Kemayoran, Jakarta Pusat 10650
          </div>
        </div>
      </div>
    </footer>
  );
}
