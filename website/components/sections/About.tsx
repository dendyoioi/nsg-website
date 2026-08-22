import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function About({ t }: { t: Content }) {
  return (
    <section id={site.anchors.about} className="bg-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow={t.about.eyebrow} title={t.about.heading} />
            {t.about.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="mt-5 leading-relaxed text-ink/75">
                {p}
              </p>
            ))}
            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
                {t.about.valuesLabel}
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {t.about.values.map((v) => (
                  <span
                    key={v.name}
                    title={v.description}
                    className="cursor-default rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-300"
                  >
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-8 text-white">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                {t.about.visionLabel}
              </span>
              <p className="mt-3 leading-relaxed text-white/90">&ldquo;{t.about.vision}&rdquo;</p>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-8">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
                {t.about.missionLabel}
              </span>
              <ul className="mt-4 space-y-3">
                {t.about.missions.map((m) => (
                  <li key={m.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-ink/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
