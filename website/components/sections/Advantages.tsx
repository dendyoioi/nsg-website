import { Check, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import type { Content } from "@/content/types";

export function Advantages({ t }: { t: Content }) {
  return (
    <section id={site.anchors.advantages} className="bg-paper-alt py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.advantages.eyebrow} title={t.advantages.heading} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.advantages.items.map((item, i) => (
            <Reveal key={item} delay={(i % 4) * 0.06}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium leading-snug text-ink/85">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-950 to-brand-800 p-8 text-white sm:p-12">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-300/15 text-brand-300">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                  {t.advantages.compliance.eyebrow}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">
                  {t.advantages.compliance.heading}
                </h3>
              </div>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.advantages.compliance.items.map((item) => (
                <li key={item.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-white/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-white/15 pt-6">
              <h4 className="font-display text-base font-bold text-brand-300">
                {t.advantages.compliance.commitmentHeading}
              </h4>
              {t.advantages.compliance.commitment.map((p) => (
                <p key={p.slice(0, 32)} className="mt-3 text-sm leading-relaxed text-white/80">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
