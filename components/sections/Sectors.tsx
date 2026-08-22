import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Content } from "@/content/types";

export function Sectors({ t }: { t: Content }) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.sectors.eyebrow} title={t.sectors.heading} align="center" />
        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {t.sectors.items.map((s) => (
              <span
                key={s}
                className="rounded-full border border-brand-100 bg-paper-alt px-5 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
