"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { site } from "@/content/site";
import type { Content, Locale } from "@/content/types";

export function Header({ locale, t }: { locale: Locale; t: Content }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `#${site.anchors.about}`, label: t.nav.about },
    { href: `#${site.anchors.divisions}`, label: t.nav.divisions },
    { href: `#${site.anchors.advantages}`, label: t.nav.advantages },
  ];
  const langHref = locale === "id" ? "/en" : "/";

  function switchLang(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.location.href = langHref + window.location.hash;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-slate-800/80 bg-brand-950/90 shadow-lg backdrop-blur-md"
          : "bg-gradient-to-b from-brand-950/80 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href={`#${site.anchors.home}`} className="flex items-center gap-3">
          <Logo className="h-10 w-28" />
          <div className="hidden flex-col sm:flex">
            <span className="font-display text-sm font-bold tracking-tight text-white">
              {site.name}
            </span>
            <span className="text-[10px] font-medium text-brand-300">
              Construction & Industrial Trading
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-200 transition-colors hover:text-brand-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`#${site.anchors.contact}`}
            className="rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-5 py-2 text-sm font-bold text-brand-950 shadow-sm transition-all hover:brightness-110 hover:shadow-md"
          >
            {t.nav.contactCta}
          </a>
          <a
            href={langHref}
            onClick={switchLang}
            className="rounded-full border border-brand-400/40 bg-brand-950/50 px-3 py-1 text-xs font-bold uppercase text-brand-200 transition-colors hover:border-brand-300 hover:text-white"
          >
            {locale === "id" ? "EN" : "ID"}
          </a>
        </nav>
        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-800 bg-brand-950/98 px-6 py-5 shadow-2xl md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-200 hover:text-brand-300"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`#${site.anchors.contact}`}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand-400 px-5 py-2.5 text-center text-sm font-bold text-brand-950"
            >
              {t.nav.contactCta}
            </a>
            <a
              href={langHref}
              onClick={switchLang}
              className="text-center text-xs font-bold uppercase text-brand-300"
            >
              {locale === "id" ? "English" : "Bahasa Indonesia"}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
