import Image from "next/image";
import { ArrowDown, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Hero({ t }: { t: Content }) {
  return (
    <section
      id={site.anchors.home}
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-brand-950 text-white"
    >
      {/* Full-bleed Background Image with Dark Gradient & Ambient Mint Glow Overlay */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/hero.jpg"
          alt={t.hero.imageAlt}
          fill
          priority
          className="object-cover object-center opacity-30 brightness-75 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/90 via-brand-950/80 to-brand-950" />
        <div className="absolute -top-32 right-[-10%] h-[550px] w-[550px] rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-700/30 blur-[120px]" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 sm:py-40 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-900/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-300 backdrop-blur-md">
            <Building2 className="h-3.5 w-3.5" />
            <span>{t.hero.eyebrow}</span>
          </div>

          <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
            {t.hero.titlePre}
            <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-white bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
            {t.hero.titlePost}
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              href={`#${site.anchors.divisions}`}
              variant="brand"
              className="px-8 py-3.5 text-base shadow-lg shadow-brand-700/30"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              href={`#${site.anchors.about}`}
              variant="outline-light"
              className="px-8 py-3.5 text-base"
            >
              <span>{t.hero.ctaSecondary}</span>
            </Button>
          </div>

          {/* Floating Key Stats Grid */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {t.hero.stats.map((s, idx) => (
              <GlassCard
                key={s.label}
                className="p-5 border-white/10 bg-slate-900/60 backdrop-blur-md transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  {idx === 2 ? (
                    <ShieldCheck className="h-6 w-6 text-brand-300" />
                  ) : null}
                  <div className="font-display text-3xl font-extrabold text-white">
                    {s.value}
                  </div>
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  {s.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
