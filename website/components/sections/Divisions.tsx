import Image from "next/image";
import { ArrowRight, Building2, Check, Cpu, Layers } from "lucide-react";
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
    <section id={site.anchors.divisions} className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow={t.divisions.eyebrow}
            title={t.divisions.heading}
            align="center"
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
            {t.divisions.lead}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {t.divisions.items.map((d, i) => {
            const Icon = icons[d.icon];
            return (
              <Reveal
                key={d.number}
                delay={i * 0.1}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-xl"
              >
                {/* Image Cover with Division Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={d.image}
                    alt={d.name}
                    width={600}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-1 text-xs font-extrabold tracking-wide text-brand-950 shadow-md">
                      DIVISI {d.number}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-brand-700 shadow-sm backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-lg font-bold leading-snug text-ink sm:text-xl">
                    {d.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {d.intro}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                      Lingkup & Spesifikasi Produk
                    </div>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {d.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action */}
                  <div className="mt-8 border-t border-slate-100 pt-5">
                    <a
                      href={`#${site.anchors.contact}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700 transition-colors hover:text-brand-500"
                    >
                      <span>Konsultasi Divisi Ini</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
