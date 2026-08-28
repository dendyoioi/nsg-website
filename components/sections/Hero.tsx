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
      className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-brand-950 text-white"
    >
      {/* Full-bleed Background Image with Refined Contrast & Gradient Overlay */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/hero.jpg"
          alt={t.hero.imageAlt}
          fill
          priority
          className="object-cover object-center opacity-45 brightness-90 transition-transform duration-1000 scale-100"
        />
        {/* Layered vignette gradient: darker behind text and at top/bottom transitions */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/95 via-brand-950/70 to-brand-950" />
        <div className="absolute inset-0 bg-radial from-transparent via-brand-950/40 to-brand-950/90" />
        <div className="absolute -top-32 right-[-10%] h-[550px] w-[550px] rounded-full bg-brand-500/25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-700/35 blur-[120px] pointer-events-none" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-36 sm:py-44 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-300/40 bg-brand-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-300 backdrop-blur-md shadow-lg">
            <Building2 className="h-3.5 w-3.5" />
            <span>{t.hero.eyebrow}</span>
          </div>

          <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] drop-shadow-md">
            {t.hero.titlePre}
            <span className="bg-gradient-to-r from-brand-300 via-brand-100 to-white bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
            {t.hero.titlePost}
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg drop-shadow">
            {t.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              href={`#${site.anchors.divisions}`}
              variant="brand"
              className="px-8 py-3.5 text-base shadow-xl shadow-brand-600/30"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              href={`#${site.anchors.contact}`}
              variant="outline-light"
              className="px-8 py-3.5 text-base bg-brand-950/40 backdrop-blur-sm border-white/30 hover:bg-white/10"
            >
              <span>{t.hero.ctaSecondary}</span>
            </Button>
          </div>

          {/* Floating Key Stats Grid */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {t.hero.stats.map((s, idx) => (
              <GlassCard
                key={s.label}
                className="p-5 border-white/15 bg-brand-950/75 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/40 shadow-xl"
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
