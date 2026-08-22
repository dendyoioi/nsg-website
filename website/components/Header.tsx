"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/LogoMark";
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-brand-950/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`#${site.anchors.home}`} className="flex items-center gap-2.5 text-white">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-base font-bold tracking-wide">
            {site.brand}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-white/85 transition-colors hover:text-brand-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`#${site.anchors.contact}`}
            className="rounded-full bg-brand-300 px-5 py-2 text-sm font-bold text-brand-950 transition-colors hover:bg-white"
          >
            {t.nav.contactCta}
          </a>
          <a
            href={langHref}
            onClick={switchLang}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold uppercase text-white transition-colors hover:border-brand-300 hover:text-brand-300"
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
        <nav className="border-t border-white/10 bg-brand-950/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-white/85"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`#${site.anchors.contact}`}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-brand-300 px-5 py-2.5 text-center text-sm font-bold text-brand-950"
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
