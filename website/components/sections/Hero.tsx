import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Hero({ t }: { t: Content }) {
  return (
    <section id={site.anchors.home} className="relative overflow-hidden bg-brand-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-[480px] w-[560px] rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute bottom-[-25%] left-[-10%] h-[420px] w-[480px] rounded-full bg-brand-700/40 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-36 sm:pt-40 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            {t.hero.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            {t.hero.titlePre}
            <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
            {t.hero.titlePost}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={`#${site.anchors.divisions}`}>{t.hero.ctaPrimary}</Button>
            <Button href={`#${site.anchors.contact}`} variant="outline-light">
              {t.hero.ctaSecondary}
            </Button>
          </div>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-4">
            {t.hero.stats.map((s) => (
              <GlassCard key={s.label} className="p-4">
                <div className="font-display text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-brand-300/90">
                  {s.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-3xl border border-white/15">
            <Image
              src="/images/hero.jpg"
              alt={t.hero.imageAlt}
              width={1400}
              height={900}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
