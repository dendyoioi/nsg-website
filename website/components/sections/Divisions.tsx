import { Building2, Check, Cpu, Layers } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

const icons = {
  building: Building2,
  layers: Layers,
  cpu: Cpu,
} as const;

export function Divisions({ t }: { t: Content }) {
  return (
    <section id={site.anchors.divisions} className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.divisions.eyebrow} title={t.divisions.heading} />
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{t.divisions.lead}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.divisions.items.map((d, i) => {
            const Icon = icons[d.icon];
            return (
              <Reveal
                key={d.number}
                delay={i * 0.08}
                className="flex flex-col rounded-2xl border border-brand-100 bg-paper p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-3xl font-extrabold text-brand-100">
                    {d.number}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold leading-snug text-ink">
                  {d.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{d.intro}</p>
                <ul className="mt-5 grid grid-cols-1 gap-2 border-t border-brand-100 pt-5 sm:grid-cols-2">
                  {d.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-ink/75">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
